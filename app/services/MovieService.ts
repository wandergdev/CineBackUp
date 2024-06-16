import axios from "axios";
import { Movie } from "@/db/models/Movie/model/Movie";
import { Controller } from "@/libraries/Controller";
import { Request, Response } from "express";

const API_URL = process.env.THE_MOVIE_DB_URL;
const ACCESS_TOKEN = process.env.THE_MOVIE_DB_TOKEN;
const API_KEY = process.env.API_KEY;

export const fetchSingleMovieData = async (movieId: number) => {
  try {
    console.log("Fetching single movie data for ID:", movieId);
    const finalUrl = `https://api.themoviedb.org/3/movie/${movieId}?language=es-MX&api_key=${API_KEY}`;
    console.log("Final URL:", finalUrl);
    const response = await axios.get(finalUrl, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });
    console.log("Fetched single movie data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching single movie data from API:", error);
    throw new Error("Error fetching single movie data from API");
  }
};

export const fetchMovieTrailerKey = async (movieId: number) => {
  try {
    const finalUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}&language=es-MX`;
    const response = await axios.get(finalUrl, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });
    const trailer = response.data.results.find(
      (video: any) => video.type === "Trailer" && video.site === "YouTube",
    );
    return trailer ? trailer.key : null;
  } catch (error) {
    console.error("Error fetching movie trailer key from API:", error);
    throw new Error("Error fetching movie trailer key from API");
  }
};

export const searchMoviesFromApi = async (query: string) => {
  try {
    const response = await axios.get(API_URL, {
      params: { query, language: "es-MX", api_key: API_KEY },
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error searching movies from API:", error);
    throw new Error("Error searching movies from API");
  }
};

export const getMovieListFromApi = async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    const response = await searchMoviesFromApi(String(name));
    return Controller.ok(res, response);
  } catch (error) {
    console.error(error);
    return Controller.serverError(res, error.message);
  }
};

export const mapMovieToDatabase = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.query;
    const movieIdNumber = Number(movieId);

    if (isNaN(movieIdNumber)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const response = await fetchSingleMovieData(movieIdNumber);
    const trailerKey = await fetchMovieTrailerKey(movieIdNumber);

    const alreadyExist = await Movie.findOne({
      where: { external_id: response.id },
    });

    if (alreadyExist) {
      return res.status(409).json({
        message: "Esta película ya está registrada en tu sistema",
        data: { id: alreadyExist.id },
      });
    }

    function mapToMovie(movieData: any, trailerKey: string | null) {
      return {
        name: movieData.title,
        fecha_lanzamiento: movieData.release_date,
        duration: movieData.runtime,
        poster_path: movieData.poster_path,
        description: movieData.overview,
        genero: movieData.genres.map((genre: any) => genre.name),
        rating: Math.round(movieData.vote_average),
        external_id: movieData.id,
        trailer_key: trailerKey, // Almacena la clave del tráiler
      };
    }

    const mappedData = mapToMovie(response, trailerKey);
    const movieCreatedInDB = await Movie.create(mappedData);

    return Controller.created(res, movieCreatedInDB);
  } catch (error) {
    console.error(error);
    return Controller.serverError(res, error.message);
  }
};

export const getMovieDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByPk(id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    return Controller.ok(res, movie);
  } catch (error) {
    console.error(error);
    return Controller.serverError(res, error.message);
  }
};

// Función para obtener próximos estrenos para México y República Dominicana
export const fetchUpcomingMovies = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    const formatDate = date => date.toISOString().split("T")[0];

    const regions = ["DO", "MX"];
    const promises = regions.map(region => {
      const finalUrl = `https://api.themoviedb.org/3/movie/upcoming?region=${region}&language=es-MX&primary_release_date.gte=${formatDate(
        today,
      )}&primary_release_date.lte=${formatDate(nextMonth)}&api_key=${API_KEY}`;
      return axios.get(finalUrl, {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      });
    });

    const responses = await Promise.all(promises);
    const combinedResults = responses.flatMap(
      response => response.data.results,
    );

    // Eliminar duplicados por id
    const uniqueResults = combinedResults.filter(
      (movie, index, self) => index === self.findIndex(m => m.id === movie.id),
    );

    res.status(200).send({ data: uniqueResults });
  } catch (error) {
    console.error("Error fetching upcoming releases:", error);
    return Controller.serverError(res, error.message);
  }
};
