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
    $(".js-selectedList").addClass("hidden");
    getSuggestion();
    hideList();
    viewList();
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
  $(".js-selectedList").addClass("hidden");
}

/*
 * Responsible for selecting a random result from the returned results array and displaying on DOM
 */
function displaySuggestion(responseJson) {
  let randomSelect = Math.floor(Math.random() * 20);

  $(".suggest").attr(
    "data-mediaId",
    `${responseJson.results[randomSelect].id}`
  );

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
  handleMissingPic(responseJson);
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
    $(".js-selectList").addClass("hidden");
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
      "`handleSearchForm` ran with the user search term: " +
        currentQuerry +
        "with mediaForm: " +
        mediaForm
    );
    hideBack();
    getMedia();
    hideList();
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
 */
function displayResults(responseJson) {
  $("#js-resultList").empty();
  resultList.removeClass("hidden");
  $(".js-resultCounter").removeClass("hidden");
  $("#js-resultNum").text(responseJson.total_results);

  for (let i = 0; i < responseJson.results.length; i++) {
    $("#js-resultList").append(
      `<li class="result" data-mediaId="${responseJson.results[i].id}">
        <img id="img${
          responseJson.results[i].id
        }" src="http://image.tmdb.org/t/p/w185${responseJson.results[i]
        .poster_path || responseJson.results[i].profile_path}"></img>
        <h3 id="title${responseJson.results[i].id}">
        ${responseJson.results[i].original_title ||
          responseJson.results[i].original_name ||
          responseJson.results[i].name}</h3>
      </li>`
    );
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
    console.log("`handleResultSelect` ran and hid results list");
    $(".js-details").removeClass("hidden");
    let mediaID = $(this).attr("data-mediaId");
    getSingleResult(mediaID, mediaForm);
    handleBackToResults();
    hideList();
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
      displayDetails(responseJson, mediaForm, mediaID);
    });
}

/*
 * Responsible for handling single media response and displaying more details about selected media
 */
function displayDetails(responseJson, mediaForm, mediaID) {
  $("#js-singleDetail").attr("data-meidaId", `${mediaID}`);

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
  } else if (mediaForm === "tv") {
    $("#selectedRelease").text(
      "First Air-date: " + responseJson.first_air_date
    );
    $("#selectedPopularity").text(
      "Voter Average: " + responseJson.vote_average
    );
    if (responseJson.homepage) {
      $("#selectedTagline").text("Homepage: " + responseJson.homepage);
    }
  } else {
    $("#selectedTagline").text("Popularity: " + responseJson.popularity);
    if (responseJson.birthday === null) {
      $("#selectedPopularity").text("Birthday: Unknown");
    } else {
      $("#selectedPopularity").text("Birthday: " + responseJson.birthday);
    }
    if (responseJson.biography === "") {
      $("#selectedDescription").text("No bio is currently available.");
    } else {
      $("#selectedDescription").text("Bio: " + responseJson.biography);
    }
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

  hideResults();
}

function hideResults() {
  $(".js-results").addClass("hidden");
}

function hideDetails() {
  $(".js-details").addClass("hidden");
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
  if (localStorage.length > 0) {
    $("#js-viewList").removeClass("hidden");
  } else {
    $("#js-viewList").addClass("hidden");
  }
}

/*
 * Responsible for when user clicks "Add to List" button, converts JSON objec to string and adds to local storage
 * Should consider condition if matching element found in local storage to hide button or change to remove button
 */
function addToList() {
  $(".addToList").click(function() {
    // Select the parent <li> to store as a string and gain their data-mediaId value to use as a storage key
    let listItem = $(this).parents("li");
    console.log(listItem);
    let htmlContent = listItem[0].outerHTML;
    // let stringItem = JSON.stringify(listItem);
    console.log(htmlContent);
    console.log(typeof htmlContent);

    let storeKey = listItem[0].attributes[1].value;

    // Store the string value of the <li> with all media content
    // Prevents duplicates

    localStorage.setItem(storeKey, htmlContent);

    console.log(localStorage);
    console.log("`addToList` ran ");
    viewList();
  });
}

/*
 * Responsible for displaying user's list in localStorage
 */
function displayList() {
  $("#js-viewList").click(function() {
    $(".js-pickList").empty();
    $(".js-selectList").removeClass("hidden");
    $(".js-suggestion").addClass("hidden");
    for (let i = 0; i < localStorage.length; i++) {
      $(".js-pickList").append(localStorage.getItem(localStorage.key(i)));
    }
    console.log("`displayList` ran");
    hideDetails();
    hideResults();
  });
}

/*
 * Responsible for when user clicks "Hide List" button
 */
function handleHide() {
  $("#js-hideList").click(function() {
    hideList();
  });
}

/*
 * Responsible for hiding localStorage list
 */
function hideList() {
  $(".js-selectList").addClass("hidden");
  console.log("`hideList` ran and hid selectedList");
}

function revealRemove() {
  $("#js-remove").removeClass("hidden");
}

/*
 * Responsible for when user clicks "Remove From List" button and removes media item from localStorage
 */
function handleRemove() {
  $("#js-remove").click(function() {
    console.log("`handleRemove` ran but currently doesnt do anything");
  });
}

/*
 * Responsible for when user clicks "Remove From List" button and removes media item from localStorage
 */
function clearList() {
  $("#js-clearList").click(function() {
    localStorage.clear();
    console.log("`clearList` ran and has cleared localStorage");
    hideList();
    viewList();
    displayList();
  });
}

/*
 * Responsible for creating e-mail with media list ready for e-mail
 */
function emailList() {
  $("#js-emailList").click(function() {
    console.log("`emailList` ran but currently doesnt do anything");
  });
}

/*
 * Responsible for hiding "Add to List" button and unhiding "Remove From List" button
 */
function hideAdd() {}

/***^_^****/

function vidVoid() {
  addToList();
  clearList();
  displayList();
  handleBack();
  handleHide();
  handleNext();
  handleSearchForm();
  handleSearch();
  handleSuggest();
  handleRemove();
  hideList();
  viewList();

  console.log("VidVoid App Active");
  console.log("Number of items in local storage: " + localStorage.length);
  console.log(localStorage);
}

/* Call */

vidVoid();
