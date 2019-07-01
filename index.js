// Global Variables
const apiKey = "41852c5354f2d366f322d470d71ec51f";
const baseURL = "https://api.themoviedb.org/3/search/";
let page = 1;
let resultList = $(".js-results");

// Variables set by user input
let currentQuery;
let mediaForm;

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
 * Responsible for setting user input to currentQuery and reseting page to 1
 */
function handleSearchForm() {
  $("#js-searchForm").submit(event => {
    event.preventDefault();
    page = 1;
    currentQuerry = $("#js-query").val();
    mediaForm = $("#media").val();

    console.log(
      "`handleSearchForm` ran with the user search term: " + currentQuerry
    );
    hideBack();
    getMedia();
  });
}

/*
 * Responsible for formatting params object into a queriable string for the url
 */
function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(
    key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  );
  return queryItems.join("&");
}

/*
 * Responsible for creating url for GET request based on parameters, selected media form, and currentQuery
 */
function createURL() {
  const params = {
    query: currentQuerry,
    page: page,
    api_key: apiKey,
    indlucde_adult: false,
    include_video: false,
    language: "en-US"
  };

  const queryString = formatQueryParams(params);
  const rawurl = baseURL + mediaForm + "?" + queryString;
  console.log("`createURL` ran and produced this url: " + rawurl);
  return rawurl;
}

/*
 * Responsible for sending GET request with given url and passing the returned JSON object to be displayed
 */
function getMedia() {
  let url = createURL();
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statustext);
    })
    .then(responseJson => {
      displayResults(responseJson);
      console.log("`getMedia` ran and returned: ");
      console.log(responseJson);
    });
}

/*
 * Responsible for displaying the given results, unhiding results list and result Num, and emptying previous list
 * Should likely be two functions, one displayResults to unhide area and update display
 * The other function to display the actual content
 */
function displayResults(responseJson) {
  $("#js-resultList").empty();
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
  handleResultSelect(mediaForm);
  showNext(responseJson);
  hideBack(responseJson);
  trackPage();
}

/*
 * Responsible for replacing any missing pictures with the "missing image" jpeg
 */
function handleMissingPic(responseJson) {
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

/*
 * Responsible for when any media <li> result is clicked, hides the results list, and unhides the details section
 */
function handleResultSelect(mediaForm) {
  $(".result").click(function() {
    resultList.addClass("hidden");
    console.log("`handleResultSelect` ran and hid results list");
    $(".js-details").removeClass("hidden");
    let mediaID = $(this).attr("id");
    getSingleResult(mediaID, mediaForm);
    handleBackToResults();
  });
}

/*
 * Responsible for sending GET request based on the media ID and mediaForm
 */
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
    .then(responseJson => {
      console.log("`getSingleResult` ran and returned: ");
      console.log(responseJson);
      displayDetails(responseJson, mediaForm);
    });
}

/*
 * Responsible for handling single media response and displaying more details about selected media
 */
function displayDetails(responseJson, mediaForm) {
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

  // If the response doesn't have a pic, replace with missingImage
  if (!responseJson.poster_path && !responseJson.profile_path) {
    $("#selectedImage").attr("src", "missingImage.jpeg");
  }
}

/*
 * Responsible for handling button click "Back to Results" which hides details and unhides results list
 */
function handleBackToResults() {
  // Unhides the results div and hides the details div
  $("#backResults").click(function() {
    $(".js-details").addClass("hidden");
    resultList.removeClass("hidden");
    console.log("`handleBackToResults` ran");
  });
}

/** * 
 * 
 This section handles page navigation and page display, as well as the returned num of results from a search.
 * 
 **/

/*
 * Responsible for hiding "Next" button when page = max num of pages, and unhiding "Next" when results are > 20
 */
function showNext(responseJson) {
  if (page === responseJson.total_pages) {
    nextButton.addClass("hidden");
    console.log('`showNext` ran and hid "Next" button as max page reached');
  } else if (responseJson.total_results > 20) {
    nextButton.removeClass("hidden");
  }
}

/*
 * Responsible for hiding the "Back" button if page = 1
 */
function hideBack() {
  if (page === 1) {
    backButton.addClass("hidden");
  }
}

/*
 * Responsible for when user clicks "Next" button, increases page +1, and reveals the back button if page > 1
 */
function handleNext() {
  nextButton.click(function() {
    page += 1;
    console.log("`handleNext` ran and page is now:" + page);
    getMedia(currentQuery);
    if (page > 1) {
      backButton.removeClass("hidden");
      trackPage();
    }
  });
}

/*
 * Responsible for when user clicks "Back" button, decreasing page -1
 */
function handleBack() {
  backButton.click(function() {
    page -= 1;
    console.log("`handleBack` ran and page is now:" + page);
    getMedia(currentQuery);
    trackPage();
  });
}

/*
 * Responsible for changing displayed page number equal to current page
 */
function trackPage() {
  $("#pageNum").text("Page: " + page);
}

/*
*
Section handles storing selected objects in localStorage to display in personal list  
*
*/

/*
 * Responsible for displaying "View My List" button if any exists
 */
function viewList() {
  if (localStorage.length > 1) {
    $("#js-viewList").removeClass("hidden");
  }
}

/*
 * Responsible for when user clicks "Add to List" button, converts JSON objec to string and adds to local storage
 */
function addToList() {
  $("#addToList").click(function() {
    console.log(this);
  });
}

/*
 * Responsible for displaying user's list in localStorage and converting from string to JSON object
 */
function displayList() {
  let savedArray = JSON.parse(localStorage.getItem());
  console.log(savedArray);
}

/*
 * Responsible for hiding localStorage list
 */
function hideList() {
  $("#js-hideList").click(function() {
    $("#js-pickList").addClass("hidden");
  });
}

/*
 * Responsible for when user clicks "Remove From List" button and removes media item from localStorage
 */
function handleRemove() {}

/*
 * Responsible for creating e-mail with media list ready for e-mail
 */
function emailList() {}

/***^_^****/

function vidVoid() {
  handleSearchForm();
  handleSuggest();
  handleSearch();
  handleNext();
  handleBack();
  console.log("VidVoid App Active");
  console.log("Number of items in local storage: " + localStorage.length);
  console.log(localStorage);
}

/* Call */

vidVoid();
