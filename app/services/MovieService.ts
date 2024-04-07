import { Movie } from "@/db/models/Movie/model/Movie";
import { Controller } from "@/libraries/Controller";
import { fetchMovieData, fetchSingleMovieData } from "@/utils/MovieFetch";
import { Request, Response } from "express";
export const getMovieListFromApi = async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    const response = await fetchMovieData(String(name));
    return Controller.ok(res, response);
  } catch (error) {
    console.error(error);
  }
};
export const mapMovieToDatabase = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.query;
    const response = await fetchSingleMovieData(Number(movieId));

    const alreadyExist = await Movie.findOne({
      where: { external_id: response.id },
    });

    if (alreadyExist)
      return Controller.conflict(
        res,
        "Esta pelicula ya esta registrada en tu sistema",
      );

    function mapToMovie(movieData: any) {
      return {
        name: movieData.title,
        duration: movieData.runtime,
        poster_path: movieData.poster_path,
        description: movieData.overview,
        gener: movieData.genres.map((genre: any) => genre.name),
        rating: Math.round(movieData.vote_average),
        external_id: movieData.id,
      };
    }

    const mappedData = mapToMovie(response);
    const movieCreatedInDB = await Movie.create(mappedData);
    return Controller.created(res, movieCreatedInDB);
  } catch (error) {
    console.error(error);
  }
};
