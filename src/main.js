import MenuComponent from "./components/menu";
import FilterComponent from "./components/filter";
import TripBoardComponent from "./components/trip-board";

import {renderComponent, RenderPosition} from "./utils/render";
import {getUniqueDays} from "./utils/common";
import {generateDays} from "./mocks/days";
import TripController from "./controllers/trip";

const DAYS_COUNT = 5;

const siteHeaderElement = document.querySelector(`.page-header`);
const siteMainElement = document.querySelector(`.page-main`);
const controlElement = siteHeaderElement.querySelector(`.trip-controls`);
const contentElement = siteMainElement.querySelector(`.page-body__container`);

const daysData = generateDays(DAYS_COUNT);

const sortedDaysData = daysData.slice().sort((a, b) => a.date.getTime() - b.date.getTime());
const uniqueDays = getUniqueDays(sortedDaysData);

renderComponent(controlElement, new MenuComponent(), RenderPosition.BEFOREEND);
renderComponent(controlElement, new FilterComponent(), RenderPosition.BEFOREEND);

const boardComponent = new TripBoardComponent();
renderComponent(contentElement, boardComponent, RenderPosition.BEFOREEND);

const tripController = new TripController(boardComponent);
tripController.render(uniqueDays);
