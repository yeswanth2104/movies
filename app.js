const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

let db = null;

const dbPath = path.join(__dirname, "moviesData.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const snakeToCamel = (each) => {
  return {
    directorId: each.director_id,
    movieId: each.movie_id,
    movieName: each.movie_name,
    leadActor: each.lead_actor,
  };
};

//GET ALL MOVIES LIST API-1

app.get("/movies/", async (request, response) => {
  const getMoviesList = `
    select movie_name from movie ;

    `;

  const movies = await db.all(getMoviesList);
  const moviesList = movies.map((each) => snakeToCamel(each));
  response.send(moviesList);
});

//POST A MOVIE API-2

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieDetails = `insert into 
    movie (director_id,movie_name,lead_actor)
    values(
       
        ${directorId},
       '${movieName}',
       '${leadActor}' 
        
    );`;

  const dbResponse = await db.run(addMovieDetails);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//GET A MOVIE (MOVIE_ID) API-3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieDetails = `select 
  *
  from 
  movie 
  where 
  movie_id=${movieId};
    `;

  const movie = await db.get(getMovieDetails);
  //const movieList = movie.map((each) => snakeToCamel(each));

  response.send(movie);
});

//PUT A MOVIE DETAILS API-4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const updatedMovieDetails = `
    update
         movie
    set
        director_id=${directorId},
        movie_name='${movieName}',
        lead_actor='${leadActor}'
    where
        movie_id=${movieId};    

    `;

  await db.run(updatedMovieDetails);
  response.send("Movie Details Updated");
});

//DELETE A MOVIE API-5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deletedMovieList = `
    delete from 
        movie 
    where
        movie_id=${movieId};    
    `;
  await db.run(deletedMovieList);
  response.send("Movie Removed");
});

//DIRECTORS

const snakeToCamelDirector = (each) => {
  return {
    directorId: each.director_id,
    directorName: each.director_name,
  };
};

//GET ALL DIRECTORS API-6

app.get("/directors/", async (request, response) => {
  const getAllDirectors = `
    select * from director order by director_id ;
    
    `;

  const directors = await db.all(getAllDirectors);
  const directorsList = directors.map((each) => snakeToCamelDirector(each));
  response.send(directorsList);
});

//GET ALL MOVIE NAMES API-7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getAllMovieNames = `select
        movie_name 
    from 
        director inner join movie on director.director_id = movie.director_id
    where
        director_id=${directorId}
    group by
        director_id=${directorId}; `;

  const movieName = await db.all(getAllMovieNames);
  response.send(movieName);
});

module.exports = app;
