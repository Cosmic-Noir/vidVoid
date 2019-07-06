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
This section handles the "Fill the Void" button, generating a single, random tv or movie suggestion
 * 
**/

/*
 * Responsible for when "Fill the Void" button is pressed and unhides .js-results <ul>
 */
function handleSuggest() {
  $("#genRandom").click(function() {
    console.log(
      "`handleSuggest` ran due to 'Fill The Void' button being pressed"
    );
    getSuggestion();
    hideList();
    hideResults();
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
 * Responsible for hiding the suggestion section
 */
function hideSuggestion() {
  $(".js-suggestion").addClass("hidden");
}

/*
 * Responsible for selecting a random result from the returned results array and displaying on DOM
 */
function displaySuggestion(responseJson) {
  $(".js-suggestion").removeClass("hidden");

  let randomSelect = Math.floor(Math.random() * 20);

  $(".suggest").attr(
    "data-mediaId",
    `${responseJson.results[randomSelect].id}`
  );

  if (!responseJson.results[randomSelect].poster_path) {
    $("#suggestedImage").attr("src", "missingImage.jpeg");
  } else {
    $("#suggestedImage").attr(
      "src",
      `http://image.tmdb.org/t/p/w185${
        responseJson.results[randomSelect].poster_path
      }`
    );
  }

  $("#suggestedTitle").text(
    responseJson.results[randomSelect].original_title ||
      responseJson.results[randomSelect].name
  );

  $("#suggestedRating").text(
    "Average Rating: " + responseJson.results[randomSelect].vote_average + "/10"
  );

  $("#suggestedRelease").text(
    "Release Date: " +
      (responseJson.results[randomSelect].release_date ||
        responseJson.results[randomSelect].first_air_date)
  );

  if (!responseJson.results[randomSelect].overview) {
    $("#suggestedDesc").text("No description available at this time.");
  } else {
    $("#suggestedDesc").text(responseJson.results[randomSelect].overview);
  }

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
  hideDetails();
  hideList();
  hideResults();
  makePageRandom();
  handleAddRemove(responseJson.results[randomSelect].id);
  // handleAddRemove(responseJson.results[randomSelect].id);
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
    $("#js-searchForm").removeClass("hidden");
    $(".js-search").removeClass("hidden");
    hideSuggestion();
    hideList();
    hideDetails();
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
 * Responsible for when any media <li> result is clicked and unhides the details section
 */
function handleResultSelect(mediaForm) {
  $(".result").click(function() {
    console.log("`handleResultSelect` ran and hid results list");
    $(".js-details").removeClass("hidden");
    let mediaID = $(this).attr("data-mediaId");
    getSingleResult(mediaID, mediaForm);
    handleBackToResults();
    hideList();
    handleAddRemove(mediaID);
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
  $(".backResults").removeClass("hidden");

  $(".js-singleDetail").attr("data-meidaId", `${mediaID}`);

  if (!responseJson.poster_path && !responseJson.profile_path) {
    $("#selectedImage").attr("src", "missingImage.jpeg");
  } else {
    $("#selectedImage").attr(
      "src",
      `http://image.tmdb.org/t/p/w185${responseJson.poster_path ||
        responseJson.profile_path}`
    );
  }

  $("#selectedTitle").text(
    responseJson.original_title ||
      responseJson.original_name ||
      responseJson.name
  );

  $("#selectedDescription").text(responseJson.overview);

  $("#selectedPopularity").text("Voter Average: " + responseJson.vote_average);

  if (mediaForm === "movie") {
    $("#selectedRelease").text("Release Date: " + responseJson.release_date);
    if (responseJson.tagline) {
      $("#selectedTagline").text("Tagline: " + responseJson.tagline);
    } else {
      $("#selectedTagline").empty();
    }
  } else if (mediaForm === "tv") {
    $("#selectedRelease").text(
      "First Air-date: " + responseJson.first_air_date
    );

    if (responseJson.homepage) {
      $("#selectedTagline").text("Homepage: " + responseJson.homepage);
    }
  } else {
    // mediaForm === actor/actress
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

  console.log(
    "`displayDetails` ran and provided details on: " +
      (responseJson.name ||
        responseJson.original_name ||
        responseJson.original_title)
  );

  hideResults();
  handleAddRemove(mediaID);
}

/*
 * Responsible for hiding js-resultList
 */
function hideResults() {
  $(".js-results").addClass("hidden");
  $("#js-searchForm").addClass("hidden");
}

/*
 * Responsible for hiding js-singleDetail
 */
function hideDetails() {
  $(".js-details").addClass("hidden");
}

/*
 * Responsible for handling button click "Back to Results" unhides results list
 */
function handleBackToResults() {
  $(".backResults").click(function() {
    resultList.removeClass("hidden");
    hideDetails();
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
Section handles storing selected objects in localStorage to display in pickList  
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

    // console.log(htmlContent);
    // console.log(typeof htmlContent);

    let storeKey = listItem[0].attributes[1].value;

    // Store the string value of the <li> with all media content

    localStorage.setItem(storeKey, htmlContent);

    console.log(localStorage);
    console.log("`addToList` ran ");
    viewList();
    handleAddRemove(storeKey);
  });
}

/*
 * Responsible for when user clicks "View My List" button
 */
function clickList() {
  $("#js-viewList").click(function() {
    displayList();
    console.log("`displayList` ran");
    hideDetails();
    hideResults();
  });
}

/*
 * Responsible for displaying user's list in localStorage
 */
function displayList() {
  $(".js-pickList").empty();
  $(".js-selectList").removeClass("hidden");

  for (let i = 0; i < localStorage.length; i++) {
    $(".js-pickList").append(localStorage.getItem(localStorage.key(i)));
    $(".addToList").addClass("hidden");
    // target the "Back To Results" button to remove it
    $(".backResults").addClass("hidden");
    $(".remove").removeClass("hidden");
    // hideBackToResults(localStorage.getItem(localStorage.key(i)));

    console.log("`displayList` ran ");
  }
  handleRemove();
  hideSuggestion();
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

/*
 * Responsible for when user clicks "Remove From List" button and removes media item from localStorage
 */
function handleRemove() {
  $(".remove").click(function() {
    let listItem = $(this).closest("li");
    console.log(listItem);
    let inputID = listItem[0].attributes[1].value;
    console.log(listItem[0].parentElement);

    console.log(
      "`handleRemove` ran and removed this key from localStorage: " + inputID
    );

    if (listItem.parents(".js-selectList").length == 1) {
      // YES, the child element is inside the parent
      console.log('the selected li is a child of ".js-selectList"');
      listItem.addClass("hidden");
    } else {
      // NO, it is not inside
      console.log('the selected li is not a chld of ".js-selectList"');
      handleAddRemove();
    }

    localStorage.removeItem(inputID);
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
function handleEmail() {
  let emailAddress;
  $("#js-emailList").click(function() {
    emailAddress = $("#toEmailAddress").val();
    event.preventDefault();

    let totalContent;
    for (let i = 1; i < localStorage.length + 1; i++) {
      let content = localStorage.getItem(localStorage.key(i));
      totalContent += content;
      console.log(totalContent);
    }

    let params = {
      user_id: "user_NbIPmNUvbtkVqjSpN62Vs",
      service_id: "gmail",
      template_id: "vidvoid_email",
      template_params: {
        emailAddress: emailAddress,
        content: totalContent
      }
    };

    let headers = {
      "Content-type": "application/json"
    };

    let options = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(params)
    };

    fetch("https://api.emailjs.com/api/v1.0/email/send", options)
      .then(response => {
        if (response.ok) {
        }
        throw new Error(alert(response.statusText));
      })
      .then(() => console.log("response successful, email should have sent"));

    console.log("`handleEmail` ran and sent to email: " + emailAddress);
  });
}

/*
 * Responsible for hiding "Add to List" button and unhiding "Remove From List" button
 */
function handleAddRemove(mediaID) {
  console.log("The mediaID used was : " + mediaID);
  if (localStorage[mediaID]) {
    console.log(
      "The key existed in local storage so the remove button was revealed"
    );
    $(".addToList").addClass("hidden");
    $(".remove").removeClass("hidden");
  } else {
    console.log("No match found, hides remove button and reveals add button");
    $(".addToList").removeClass("hidden");
    $(".remove").addClass("hidden");
  }
}

/*
 * Responsible for updating "body" content of email list
 */
// function handleEmail() {

//   let formatContent = document
//     .createRange()
//     .createContextualFragment(totalContent);

//   console.log(formatContent);

//   let htmlString = "<html><head></head><body><h1>Hello</h1></body></html>";

//   $("#emailContent").attr(
//     "href",
//     `mailto:?subject=VidVoid Pick List&body=${htmlString}`
//   );
// }

/***^_^****/

function vidVoid() {
  addToList();
  clearList();
  clickList();
  handleBack();
  handleEmail();
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
