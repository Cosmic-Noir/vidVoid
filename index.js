// API key
const apiKey = "41852c5354f2d366f322d470d71ec51f";
const baseURL = "https://api.themoviedb.org/3/search/";
let page = 1;
let currentQuery;

function handleSuggest() {
  // User clicks suggest button to generate a recommended result
  $("#genRandom").click(function() {
    console.log("`handleSuggest` has run");
    getSuggestion();
    // In case they were previously using search, hide the search form when asking for a suggestion
    $(".js-search").addClass("hide");
    $(".js-results").addClass("hidden");
  });
}

function handleSearch() {
  // user clickes Search The Void button and reveals the search form options
  $("#showSearch").click(function() {
    $(".js-search").removeClass("hidden");
    $(".js-suggestion").addClass("hidden");
  });
}

function getSuggestion() {
  // sends GET request to MDB for trending movie/tv media
  let url =
    "https://api.themoviedb.org/3/trending/all/week?api_key=41852c5354f2d366f322d470d71ec51f";
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statustext);
    })
    .then(responseJson => displaySuggestion(responseJson));
  console.log("getSuggestion has run and should have returned a Json object");
}

function displaySuggestion(responseJson) {
  // Should randomly select one result from array and display those details
  $(".js-suggestion").removeClass("hidden");
  $(".js-search").addClass("hidden");
  $(".js-details").addClass("hidden");
  console.log(responseJson);
  let randomSelect = Math.floor(Math.random() * 20);
  console.log(randomSelect);
  $("#suggestedImage").attr(
    "src",
    `http://image.tmdb.org/t/p/w185${
      responseJson.results[randomSelect].poster_path
    }`
  );
  $("#suggestedTitle").text(
    responseJson.results[randomSelect].original_title ||
      responseJson.results[randomSelect].name
  );
  $("#suggestedRating").text(responseJson.results[randomSelect].vote_average);
  $("#suggestedRelease").text(responseJson.results[randomSelect].release_date);
  $("#suggestedDesc").text(responseJson.results[randomSelect].overview);

  console.log("displaySuggestion has run");
}

function handleSearchForm() {
  // handles search into query from form data
  $("#js-searchForm").submit(event => {
    event.preventDefault();
    page = 1;
    // Convert user input into variable to pass as a param
    let query = $("#js-query").val();
    currentQuery = query;
    // Hide back button as the first page will return to 1
    $("#back").addClass("hidden");
    console.log("`handleSearchForm` ran");
    getMedia(query);
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
    page: page,
    api_key: apiKey,
    indlucde_adult: false,
    include_video: false,
    language: "en-US"
  };
  // Calls either TV, Movie, or person
  let mediaForm = $("#media").val();

  const queryString = formatQueryParams(params);
  const url = baseURL + mediaForm + "?" + queryString;
  console.log(url);
  console.log("`getMedia` ran, returned the below JSON object:");

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
  for (let i = 0; i < responseJson.results.length; i++) {
    $("#js-resultList").append(
      `<li class="result" id="${responseJson.results[i].id}">
        <img id="img${responseJson.results[i].id}" src=""></img>
        <h3 id="title${responseJson.results[i].id}">TITLE</h3>
        <h4 id="rating${responseJson.results[i].id}">RATING</h4>
        <h4 id="release${responseJson.results[i].id}"></h4>
      </li>`
    );
  }

  // New if statements will add correct content depending on mediaForm
  if (mediaForm === "movie") {
    for (let i = 0; i < responseJson.results.length; i++) {
      $(`#img${responseJson.results[i].id}`).attr(
        "src",
        `http://image.tmdb.org/t/p/w185${responseJson.results[i].poster_path}`
      );
      $(`#title${responseJson.results[i].id}`).text(
        `${responseJson.results[i].original_title}`
      );
      $(`#rating${responseJson.results[i].id}`).text(
        `${responseJson.results[i].vote_average}`
      );
      $(`#release${responseJson.results[i].id}`).text(
        `${responseJson.results[i].release_date}`
      );
    }
    console.log("`displayResults` ran and displayed movie results");
  }

  // If mediaForm === tv
  if (mediaForm === "tv") {
    for (let i = 0; i < responseJson.results.length; i++) {
      $(`#img${responseJson.results[i].id}`).attr(
        "src",
        `http://image.tmdb.org/t/p/w185${responseJson.results[i].poster_path}`
      );
      $(`#title${responseJson.results[i].id}`).text(
        `${responseJson.results[i].original_name}`
      );
      $(`#rating${responseJson.results[i].id}`).text(
        `${responseJson.results[i].vote_average}`
      );
      $(`#release${responseJson.results[i].id}`).text(
        `${responseJson.results[i].first_air_date}`
      );
    }
    console.log("`displayResults` ran and displayed tv results");
  }

  // If mediaForm === person
  if (mediaForm === "person") {
    for (let i = 0; i < responseJson.results.length; i++) {
      $(`#img${responseJson.results[i].id}`).attr(
        "src",
        `http://image.tmdb.org/t/p/w185${responseJson.results[i].profile_path}`
      );
      $(`#title${responseJson.results[i].id}`).text(
        `${responseJson.results[i].name}`
      );
      $(`#rating${responseJson.results[i].id}`).text(
        `${responseJson.results[i].popularity}`
      );
    }
    console.log("`displayResults` ran and displayed person results");
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
  handleMissingPic();
  handleResultSelect(responseJson, mediaForm);
  showNext(responseJson);
  hideBack(responseJson);
}

function handleMissingPic() {
  // replace missing picture links
}

function showNext(responseJson) {
  // unhides next button, increases current page and sends GET request for that new page
  if (page === responseJson.total_pages) {
    $("#next").addClass("hidden");
  } else if (responseJson.total_results > 20) {
    $("#next").removeClass("hidden");
    console.log("`handleNext` unhides next button if total results > 20");
  }
}

function hideBack(responseJson) {
  console.log(responseJson.page);
  if (responseJson.page === 1) {
    $("#back").addClass("hidden");
    console.log("`hideBack` ran");
  }
}

function handleNext() {
  $("#next").click(function() {
    page += 1;
    console.log("`handleNext` ran and page is now:" + page);
    getMedia(currentQuery);
    if (page > 1) {
      $("#back").removeClass("hidden");
      console.log("`handleNext` unhid #back because ");
    }
  });
}

function handleBack() {
  // unhides back button, decreases current page and sends GET request for that new page
  $("#back").click(function() {
    page -= 1;
    console.log("`handleBack` ran and page is now:" + page);
    getMedia(currentQuery);
  });
}

function handleResultSelect(responseJson, mediaForm) {
  $(".result").click(function() {
    $(".js-results").addClass("hidden");
    console.log("`handleResultSelect` ran and hid results list");
    $(".js-details").removeClass("hidden");
    let mediaID = $(this).attr("id");
    getSingleResult(mediaID, mediaForm);
    handleBackToResults();
  });
}

function getSingleResult(mediaID, mediaForm) {
  // let mediaID = 609256; // Default test value - works

  let url = `https://api.themoviedb.org/3/${mediaForm}/${mediaID}?api_key=${apiKey}`;
  console.log(url);
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statustext);
    })
    .then(responseJson => displayDetails(responseJson));
}

function handleBackToResults() {
  // Unhides the results div and hides the details div
  $("#backResults").click(function() {
    $(".js-details").addClass("hidden");
    $(".js-results").removeClass("hidden");
    console.log("`handleBackToResults` ran");
  });
}

function displayDetails(responseJson) {
  console.log(responseJson);
  // Displays details about single selected result
  $("#selectedImage").attr(
    "src",
    `http://image.tmdb.org/t/p/w185${responseJson.poster_path}`
  );
  $("#selectedTitle").text(
    responseJson.original_title || responseJson.original_name
  );
  $("#selectedTagline").text(responseJson.tagline);
  $("#selectedPopularity").text(responseJson.popularity);
  $("#selectedRelease").text(responseJson.release_date);
  $("#selectedDescription").text(responseJson.overview);
  console.log("`displayDetails` ran");
}

console.log("VidVoid App Active");

handleSearchForm();
handleSuggest();
handleSearch();
handleNext();
handleBack();
