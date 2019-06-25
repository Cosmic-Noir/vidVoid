// API key
const apiKey = "41852c5354f2d366f322d470d71ec51f";
const baseURL = "https://api.themoviedb.org/3/search/";

function handleSearchForm() {
  // handles search into query from form data
  $("#js-searchForm").submit(event => {
    event.preventDefault();

    // Convert user input into variable to pass as a param
    let searchTerm = $("#js-query").val();
    console.log("`handleSearchForm()` ran");
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

  // New for loop will add unfilled content to the containing <ul>, identified by JSON ID - Removed inner defaul text from "release date" <h4> due to no population when "person" searched.
  for (let i = 0; i < responseJson.results.length; i++){
    $('#js-resultList').append(
      `<li class="result" id="${responseJson.results[i].id}">
        <img id="img${responseJson.results[i].id}" src=""></img>
        <h3 id="title${responseJson.results[i].id}">TITLE</h3>
        <h4 id="rating${responseJson.results[i].id}">RATING</h4>
        <h4 id="release${responseJson.results[i].id}"></h4>
      </li>`
    )
  }

  // New if statements will add correct content depending on mediaForm
  if (mediaForm ==="movie") {
    for (let i = 0; i < responseJson.results.length; i++){
      $(`#img${responseJson.results[i].id}`).attr("src", `http://image.tmdb.org/t/p/w185${responseJson.results[i].poster_path}`);
      $(`#title${responseJson.results[i].id}`).text(`${responseJson.results[i].original_title}`);
      $(`#rating${responseJson.results[i].id}`).text(`${responseJson.results[i].vote_average}`);
      $(`#release${responseJson.results[i].id}`).text(`${responseJson.results[i].release_date}`);
    }
    console.log("Movie result generation complete");
  }

  // If mediaForm === tv
  if (mediaForm ==="tv") {
    for (let i = 0; i < responseJson.results.length; i++){
      $(`#img${responseJson.results[i].id}`).attr("src", `http://image.tmdb.org/t/p/w185${responseJson.results[i].poster_path}`);
      $(`#title${responseJson.results[i].id}`).text(`${responseJson.results[i].original_name}`);
      $(`#rating${responseJson.results[i].id}`).text(`${responseJson.results[i].vote_average}`);
      $(`#release${responseJson.results[i].id}`).text(`${responseJson.results[i].first_air_date}`);
    }
    console.log("TV result generation complete");
  }

   // If mediaForm === person
   if (mediaForm ==="person") {
    for (let i = 0; i < responseJson.results.length; i++){
      $(`#img${responseJson.results[i].id}`).attr("src", `http://image.tmdb.org/t/p/w185${responseJson.results[i].profile_path}`);
      $(`#title${responseJson.results[i].id}`).text(`${responseJson.results[i].name}`);
      $(`#rating${responseJson.results[i].id}`).text(`${responseJson.results[i].popularity}`);
    }
    console.log("Person result generation complete");
  }

  // If no image is located for specified title. But doesn't work. 
//   if (!responseJson.results[i].poster_path) {
//   $(`#img${responseJson.results[i].id}`).replaceWith(`
//   <img src="missingImage.jpeg">`);
//   console.log(
//     `${
//       responseJson.results[i].id
//     } img element replaced due to missing poster`
//   );
// }

  createNext(responseJson);
  handleResultSelect(responseJson);

  console.log("displayResults ran");
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

// Need to find a way to pass correct movie ID to use in new GET request - UNTESTED
function handleResultSelect(responseJson) {
  $(`.result`).click(function() {
    $(".js-results").addClass("hidden");
    console.log("handleResultSelect ran phase 1: hide results list");
    $(".js-details").removeClass("hidden");
    getSingleResult();
    handleBackResults();
  });

  console.log("handleResultSelect ran");
}

function getSingleResult() {
  // let mediaID = 9836; // Default test value - works
  
  let url = `https://api.themoviedb.org/3/movie/${mediaID}?api_key=${apiKey}`;
  console.log(url);
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statustext);
    })
    .then(responseJson => console.log(responseJson));
    // Must replace above with call to displayDetails(responseJson) - but unsure if still working after changes made without testing due to internet outage. 
}

function handleBackResults() {
  // Unhides the results div and hides the details div
  $("#backResults").click(function() {
    $(".js-details").addClass("hidden");
    $(".js-results").removeClass("hidden");
  });
}

function displayDetails(responseJson) {
  // Displays details about single selected result


}

console.log("VidVoid App Active");

handleSearchForm();
