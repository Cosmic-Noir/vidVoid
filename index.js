// Global Variables
const apiKey = "41852c5354f2d366f322d470d71ec51f";
const baseURL = "https://api.themoviedb.org/3/search/";
let page = 1;
let currentQuery;
let resultList = $(".js-results");

// Button variables
const backButton = $("#back");
const nextButton = $("#next");

/**
 * 
This section handles the "Fill the Void" button, generating a single, random tv or movie suggestion.
 * 
**/

/*
 * Responsible for when "Fill the Void" button is pressed and unhides .js-results <ul>
 */
function handleSuggest() {
  $("#genRandom").click(function() {
    console.log(
      "`handleSuggest` has run due to 'Fill The Void' button being pressed"
    );
    resultList.addClass("hidden");
    getSuggestion();
  });
}

/*
 * Responsible for requesting JSON object from MDB with global page number, uses MDB trending call for unlimited content
 */
function getSuggestion() {
  let url =
    "https://api.themoviedb.org/3/trending/all/week?api_key=41852c5354f2d366f322d470d71ec51f&page=" +
    page;
  console.log("`getSuggestion` ran with the url: " + url);
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statustext);
    })
    .then(responseJson => displaySuggestion(responseJson));
}

/*
 * Responsible for unhiding the suggestion section and hiding the search area along with search list
 */
function unHideSuggestion() {
  $(".js-suggestion").removeClass("hidden");
  $(".js-search").addClass("hidden");
  $(".js-details").addClass("hidden");
}

/*
 * Responsible for selecting a random result from the returned results array and displaying on DOM
 */
function displaySuggestion(responseJson) {
  let randomSelect = Math.floor(Math.random() * 20);

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
  $("#suggestedRating").text(
    "Average Rating: " + responseJson.results[randomSelect].vote_average
  );
  $("#suggestedRelease").text(
    "Release Date: " +
      (responseJson.results[randomSelect].release_date ||
        responseJson.results[randomSelect].first_air_date)
  );
  $("#suggestedDesc").text(responseJson.results[randomSelect].overview);

  console.log(
    "`displaySuggestion` ran and suggested the title: " +
      (responseJson.results[randomSelect].name ||
        responseJson.results[randomSelect].original_title) +
      " at index: " +
      randomSelect +
      " on page: " +
      page
  );
  console.log("`displaySuggestion` ran with the returned object: ");
  console.log(responseJson);
  unHideSuggestion();
  makePageRandom();
}

/*
 * Responsible for changing the page number to a random page between 1-1000
 */
function makePageRandom() {
  page = Math.floor(Math.random() * 1000);
  console.log("`makePageRandom` ran and the page is now: " + page);
}

/**
 * 
This sections handles the specific media search portion that returns a list of matching results.
 *
**/

/*
 * Responsible for unhiding the "search" area when "Search The Void" button is pressed
 */
function handleSearch() {
  $("#showSearch").click(function() {
    $(".js-search").removeClass("hidden");
    $(".js-suggestion").addClass("hidden");
  });
}

/*
 * Responsible for taking user input when form button is clicked and
 */
function handleSearchForm() {
  // handles search into query from form data
  $("#js-searchForm").submit(event => {
    event.preventDefault();
    page = 1;
    // Convert user input into variable to pass as a param
    currentQuerry = $("#js-query").val();

    console.log("`handleSearchForm` ran");
    hideBack();
    getMedia();
  });
}

function formatQueryParams(params) {
  // turns keys in params object into html string to append to the search URL endpoint
  const queryItems = Object.keys(params).map(
    key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  );
  return queryItems.join("&");
}

function getMedia() {
  // Takes query from user input
  const params = {
    query: currentQuerry,
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
  resultList.removeClass("hidden");
  $(".js-resultCounter").removeClass("hidden");

  $("#js-resultNum").text(responseJson.total_results);

  // New for loop will add unfilled content to the containing <ul>, identified by JSON ID - Removed inner defaul text from "release date" <h4> due to no population when "person" searched.
  for (let i = 0; i < responseJson.results.length; i++) {
    $("#js-resultList").append(
      `<li class="result" id="${responseJson.results[i].id}">
        <img id="img${responseJson.results[i].id}" src=""></img>
        <h3 id="title${responseJson.results[i].id}">TITLE</h3>
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
    }
    console.log("`displayResults` ran and displayed person results");
  }

  handleMissingPic(responseJson);
  handleResultSelect(responseJson, mediaForm);
  showNext(responseJson);
  hideBack(responseJson);
  trackPage();
}

function handleMissingPic(responseJson) {
  // replace missing picture links
  for (let i = 0; i < responseJson.results.length; i++) {
    if (
      !responseJson.results[i].poster_path &&
      !responseJson.results[i].profile_path
    ) {
      $(`#img${responseJson.results[i].id}`).attr("src", "missingImage.jpeg");
      console.log("`handleMissingPic` ran");
    }
  }
}

/** * 
 * 
 This section handles the selection of individual results from the search lists, generating content and displaying details.
 * 
 **/

function handleResultSelect(responseJson, mediaForm) {
  $(".result").click(function() {
    resultList.addClass("hidden");
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
    .then(responseJson => displayDetails(responseJson, mediaForm));
}

function handleBackToResults() {
  // Unhides the results div and hides the details div
  $("#backResults").click(function() {
    $(".js-details").addClass("hidden");
    resultList.removeClass("hidden");
    console.log("`handleBackToResults` ran");
  });
}

function displayDetails(responseJson, mediaForm) {
  console.log(responseJson);
  // Displays details about single selected result
  $("#selectedImage").attr(
    "src",
    `http://image.tmdb.org/t/p/w185${responseJson.poster_path ||
      responseJson.profile_path}`
  );
  $("#selectedTitle").text(
    responseJson.original_title ||
      responseJson.original_name ||
      responseJson.name
  );

  if (mediaForm === "movie") {
    $("#selectedRelease").text("Release Date: " + responseJson.release_date);
    $("#selectedPopularity").text(
      "Voter Average: " + responseJson.vote_average
    );
    if (responseJson.tagline) {
      $("#selectedTagline").text("Tagline: " + responseJson.tagline);
    } else {
      $("#selectedTagline").empty();
    }
  }

  if (mediaForm === "tv") {
    $("#selectedTagline").text("Homepage: " + responseJson.homepage);
    $("#selectedRelease").text(
      "First Air-date: " + responseJson.first_air_date
    );
    $("#selectedPopularity").text(
      "Voter Average: " + responseJson.vote_average
    );
  }

  if (mediaForm === "person") {
    $("#selectedTagline").text("Popularity: " + responseJson.popularity);
    $("#selectedPopularity").text("Birthday: " + responseJson.birthday);
    $("#selectedDescription").text("Bio: " + responseJson.biography);
    if (responseJson.deathday === null) {
      $("#selectedRelease").text("Date of Death: Still Alive!");
    } else {
      $("#selectedRelease").text("Date of Death: " + responseJson.deathday);
    }
  }

  $("#selectedDescription").text(responseJson.overview);
  console.log(
    "`displayDetails` ran and provided details on: " +
      (responseJson.name ||
        responseJson.original_name ||
        responseJson.original_title)
  );

  if (!responseJson.poster_path && !responseJson.profile_path) {
    $("#selectedImage").attr("src", "missingImage.jpeg");
  }
}

/** * 
 * 
 This section handles page navigation and page display, as well as the returned num of results from a search.
 * 
 **/

function showNext(responseJson) {
  // unhides next button, increases current page and sends GET request for that new page
  if (page === responseJson.total_pages) {
    nextButton.addClass("hidden");
  } else if (responseJson.total_results > 20) {
    nextButton.removeClass("hidden");
    console.log("`handleNext` unhides next button if total results > 20");
  }
}

function hideBack() {
  if (page === 1) {
    backButton.addClass("hidden");
  }
}

function handleNext() {
  nextButton.click(function() {
    page += 1;
    console.log("`handleNext` ran and page is now:" + page);
    getMedia(currentQuery);
    if (page > 1) {
      backButton.removeClass("hidden");
      console.log("`handleNext` unhid #back because ");
      trackPage();
    }
  });
}

function handleBack() {
  // unhides back button, decreases current page and sends GET request for that new page
  backButton.click(function() {
    page -= 1;
    console.log("`handleBack` ran and page is now:" + page);
    getMedia(currentQuery);
    trackPage();
  });
}

function trackPage() {
  $("#pageNum").text("Page: " + page);
}

console.log("VidVoid App Active");

/*
*
Section handles storing selected objects in localStorage to display in personal list  
*
*/

handleSearchForm();
handleSuggest();
handleSearch();
handleNext();
handleBack();

// Testing using local storage:
