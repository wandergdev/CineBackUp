import { config } from "@/config";

import axios from "axios";
const API_URL = process.env.THE_MOVIE_DB_URL;
const ACCESS_TOKEN = process.env.THE_MOVIE_DB_TOKEN;

const myHeaders = new Headers();
myHeaders.append("Authorization", `Bearer ${config.movie.THE_MOVIE_DB_TOKEN}`);

const requestOptions: RequestInit = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
};

export const fetchMovieData = async (name: string) => {
  try {
    const finalUrl = `${config.movie.THE_MOVIE_DB_URL}query=${name}&language=es-MX&api_key=${config.movie.API_KEY}`;
    console.log("Fetching movie data from URL:", finalUrl);
    const response = await fetch(finalUrl, requestOptions);
    if (!response.ok) {
      console.error("Error fetching movie data:", response.statusText);
      throw new Error(response.statusText);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching movie data:", error);
    throw new Error("Error fetching movie data");
  }
};

export const fetchSingleMovieData = async (movieId: number) => {
  try {
    console.log("Fetching single movie data for ID:", movieId);
    const finalUrl = `https://api.themoviedb.org/3/movie/${movieId}?language=es-MX&api_key=${process.env.API_KEY}`;
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
