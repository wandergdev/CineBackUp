import { config } from "@/config";

const myHeaders = new Headers();
myHeaders.append("Authorization", `Bearer ${config.movie.THE_MOVIE_DB_TOKEN}`);

const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
};

// Define an async function to perform the fetch operation
export const fetchMovieData = async (name: string) => {
  try {
    // Await the fetch call to resolve and get the response
    const finalUrl = `${config.movie.THE_MOVIE_DB_URL}query=${name}&language=es-ES`;
    const response = await fetch(finalUrl, requestOptions);
    // Await the method to read the response body and finish
    const result = await response.json();
    return result;
  } catch (error) {
    // Handle any errors that occurred during the fetch
    console.error(error);
  }
};

export const fetchSingleMovieData = async (movieId: number) => {
  try {
    // Await the fetch call to resolve and get the response
    const finalUrl = `https://api.themoviedb.org/3/movie/${movieId}?language=es-ES`;
    const response = await fetch(finalUrl, requestOptions);
    // Await the method to read the response body and finish
    const result = await response.json();
    return result;
  } catch (error) {
    // Handle any errors that occurred during the fetch
    console.error(error);
  }
};
