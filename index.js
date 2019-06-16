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
    .then(responseJson => console.log(responseJson));
}

// Create parameters string by passing params object then create

console.log("VidVoid App Active");

handleForm();
