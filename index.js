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
    .then(responseJson => displayResults(responseJson));
}

function displayResults(responseJson) {
  // Displays results returned from MDB.
  console.log(responseJson);

  // Empty list per each search
  $("#js-resultList").empty();

  // Unhide results div
  $(".js-results").removeClass("hidden");
  $(".js-resultCounter").removeClass("hidden");

  $("#js-resultNum").text(responseJson.total_results);

  for (let i = 0; i < responseJson.results.length - 1; i++) {
    $("#js-resultList").append(`
    <li class="result">
      <img src="https://image.tmdb.org/t/p/w185/${
        responseJson.results[i].poster_path
      }">
      <h3>${responseJson.results[i].original_title}</h3>
      <h4>Average Rating: ${responseJson.results[i].vote_average}</h4>
      <h4>Released: ${responseJson.results[i].release_date}</h4>
    </li>
    `);
    console.log("the inner loop ran");
  }
  console.log("displayResults ran");
}

// Create parameters string by passing params object then create

console.log("VidVoid App Active");

handleForm();
