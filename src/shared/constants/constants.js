import { server } from "typescript";

export const propertiesToInclude = ["id", "selectable"];
export const DebounceTimeout = 1000;
export const defaultTextOptions = {
  underline: false,
  textAlign: "left",
  charSpacing: 0,
  fill: "#000000",
  fontFamily: "Open Sans",
  fontSize: 12,
  lineHeight: 12,
  isGroup: false,
  isMultiple: false,
  styles: [],
  font: {},
  activeStyle: {},
};

export const projectPerPage = [5, 10, 15, 20];
export const storyGenerationProjectsFilters = ["All", "Saved", "Generated"];

// src/constants/notFoundMessages.js
export const notFoundMessages = {
  default: {
    heading: "Page content not found",
    description: "The page you’re looking for does not exist on this website.",
    buttonText: "Go to Home",
    buttonLink: "/",
  },
  api404: {
    heading: "Content Not Available",
    description: "The data you're trying to fetch doesn't exist or the API endpoint is incorrect.",
    buttonText: "Try Again",
    buttonLink: -2,
  },
  api500: {
    heading: "Server Error",
    description: "An error occurred while fetching the content. Please try again later.",
    buttonText: "Go Back Now",
    buttonLink: -2,
  },

};




