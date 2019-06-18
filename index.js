// API key
const apiKey = "41852c5354f2d366f322d470d71ec51f";
const baseURL = "https://api.themoviedb.org/3/search/";

function handleForm() {
  // handles search into query from form data
  $("#js-searchForm").submit(event => {
    event.preventDefault();

    // Convert user input into variable to pass as a param
    let searchTerm = $("#js-query").val();
    console.log("`handleForm()` ran");
    getMedia(searchTerm);
  });
}

function formatQueryParams(params) {
  // turns keys in params object into html string to append to the search URL endpoint
  const queryItems = Object.keys(params).map(
    key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  );
  return queryItems.join("&");
}

function getMedia(query) {
  // Takes keyword from user input
  const params = {
    query: query,
    page: 1,
    api_key: apiKey,
    indlucde_adult: false,
    include_video: false,
    language: "en-US"
  };
  // Calls either TV or Movies
  let mediaForm = $("#media").val();

  const queryString = formatQueryParams(params);
  const url = baseURL + mediaForm + "?" + queryString;
  console.log(url);

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statustext);
    })
    .then(responseJson => displayResults(responseJson, mediaForm));
}

function displayResults(responseJson, mediaForm) {
  // Displays results returned from MDB.
  console.log(responseJson);

  // Empty list per each search
  $("#js-resultList").empty();

  // Unhide results div
  $(".js-results").removeClass("hidden");
  $(".js-resultCounter").removeClass("hidden");

  $("#js-resultNum").text(responseJson.total_results);

  if (mediaForm === "movie") {
    for (let i = 0; i < responseJson.results.length; i++) {
      $("#js-resultList").append(`
      <li class="result" id="result${responseJson.results[i].id}">
        <img id="pic${
          responseJson.results[i].id
        }" src="https://image.tmdb.org/t/p/w185/${
        responseJson.results[i].poster_path
      }">
        <h3>${responseJson.results[i].original_title}</h3>
        <h4>Average Rating: ${responseJson.results[i].vote_average}</h4>
        <h4>Released: ${responseJson.results[i].release_date}</h4>
      </li>
      `);
    }
    console.log("Movie result generation complete");
  }

  if (mediaForm === "tv") {
    for (let i = 0; i < responseJson.results.length; i++) {
      $("#js-resultList").append(`
      <li class="result" id="result${responseJson.results[i].id}">
        <img id="pic${
          responseJson.results[i].id
        }" src="https://image.tmdb.org/t/p/w185/${
        responseJson.results[i].poster_path
      }">
        <h3>${responseJson.results[i].original_name}</h3>
        <h4>Average Rating: ${responseJson.results[i].vote_average}</h4>
        <h4>First Air Date: ${responseJson.results[i].first_air_date}</h4>
      </li>
      `);
      // If show does not have a poster_path, remove broken link element.
      if (!responseJson.results[i].poster_path) {
        $(`#pic${responseJson.results[i].id}`).replaceWith(`
        <img src="missingImage.jpeg">`);
        console.log(
          `${
            responseJson.results[i].original_name
          } img element removed due to missing poster`
        );
      }
    }
    console.log("TV result generation complete");
  }

  if (mediaForm === "person") {
    for (let i = 0; i < responseJson.results.length; i++) {
      $("#js-resultList").append(`
      <li class="result" id="result${responseJson.results[i].id}">
        <img id="pic${
          responseJson.results[i].id
        }" src="https://image.tmdb.org/t/p/w185/${
        responseJson.results[i].profile_path
      }">
        <h3>${responseJson.results[i].name}</h3>
        <h4>Popularity Rating: ${responseJson.results[i].popularity}</h4>
      </li>
      `);
      // If show does not have a poster_path, remove broken link element.
      if (!responseJson.results[i].profile_path) {
        $(`#pic${responseJson.results[i].id}`).replaceWith(`
        <img src="missingImage.jpeg">`);
        console.log(
          `${
            responseJson.results[i].name
          } img element removed due to missing poster`
        );
      }
    }
    console.log("Person result generation complete");
  }

  createNext(responseJson);

  console.log("displayResults ran");
  // call function to hanlde clicking on any movie result
}

function createNext(responseJson) {
  // First create the button if the results are more than 20
  if (responseJson.total_results - 20 > 20) {
    $(".js-results").append(`
    <button id="next">Next</button>`);
    console.log("createNext ran");
  } else {
    $("#next").remove();
  }
  // displayed when user displays results, allows new GET request for page 2
}

// Create parameters string by passing params object then create

console.log("VidVoid App Active");

handleForm();
