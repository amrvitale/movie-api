require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const movies = require('./movies.json');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(helmet());


app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
    console.log('apiToken');
  
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
      return res.status(401).json({ error: 'Unauthorized request' })
    }
    // move to the next middleware
    next()
  });

  app.get('/movie', function handleGetMovies (req, res){
    let response = movies;
      const { genre = '', country = '', avg_vote = ''} = req.query;
  

  function validateString(input) {
      if(Number.isNaN(parseFloat(input))) {
          return res
            .status(400)
            .json( {error: 'Search must be a string.'} )
      }
  }

  if (genre) {
      if(!(isNaN(parseFloat(genre)))) {
          return res
            .status(400)
            .json( {error: 'Genre search must be a string.'} );

      }

      const validGenres = ['Animation', 'Drama', 'Comedy', 'Romantic', 'Drama', 'Crime', 'Horror', 'Documentary', 'Action', 'Thriller', 'Adventure', 'Fantasy', 'Musical', 'Biography', 'History', 'War', 'Grotesque', 'Western', 'Spy'];
     
      const lowerCaseValidGenres = validGenres.map(genre => genre.toLowerCase());
      
      if (!lowerCaseValidGenres.includes(genre.toLowerCase())) {
        return res
          .status(400)
          .json({ error: 'Genre must be one of the following: Animation, Drama, Comedy, Romantic, Drama, Crime, Horror, Documentary, Action, Thriller, Adventure, Fantasy, Musical, Biography, History, War, Grotesque, Western, Spy' });
      } 
  }

  const validCountries = [];
  function makeValidCountryArray () {
    for( let i = 0; i < movies.length; i++ ) {
      let movieCountries = (movies[i].country.split(', '));
      movieCountries.forEach(country => {
        if( !(validCountries.includes(country)) ) {
          validCountries.push(country);
        }
      });      
    }
    return validCountries;
  }
  makeValidCountryArray();

  if (country) {
      if(!(isNaN(parseFloat(country)))) {
          return res    
            .status(400)
            .json( {error: 'Country search must be a string'});
      }

      if (!(validCountries.map(country => country.toLowerCase())).includes(country.toLowerCase())) {
        return res
          .status(400)
          .json({error: `Country should be one of the following:${validCountries.map(country =>  ` ${country}`)}`});
      }
    }

   if(avg_vote) {
       if(isNaN(avg_vote)|| avg_vote <= 1 || avg_vote >= 10) {
           return res
            .status(400)
            .json( {error: 'Vote must be between 1 and 10'});
       }
   } 

   let results = movies;

   if(genre) {
       results = results.filter(movie =>
         movie
            .genre.toLowerCase()
            .includes(genre.toLowerCase())
        );
   }

   if(country) {
    results = results.filter(movie =>
      movie
         .country.toLowerCase()
         .includes(country.toLowerCase())
     );
}

if(avg_vote) {
    results = results.filter(movie =>
      movie.avg_vote >= avg_vote
     );
}

res.json(response);

});

app.listen(8000, console.log('Server is running at PORT 8000.'));