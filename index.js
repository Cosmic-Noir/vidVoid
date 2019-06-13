// API key
const apiKey = "41852c5354f2d366f322d470d71ec51f";
const baseURL = "https://api.themoviedb.org/3/";

// Turn search parameter into object

const params = {};

function formatQueryParams(params) {
  // turns keys in params object into html string to append to the search URL endpoint
  const queryItems = Object.keys(params).map(
    key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  );
  return queryItems.join("&");
}

// Create parameters string by passing params object then create
const queryString = formatQueryParams(params);
const url = baseURL + "?" + queryString;

console.log("VidVoid App Active");
