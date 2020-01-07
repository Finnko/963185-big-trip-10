import TripDayComponent from "../components/trip-day";
import SortComponent, {SortType} from "../components/sort";
import NoEventsComponent from "../components/no-events";
import TripDaysComponent from "../components/trip-days";
import {renderComponent, RenderPosition} from "../utils/render";
import TripInfoComponent from "../components/trip-info";
import PointController from "./point";

const renderTripInfo = (days) => {
  const routeElement = document.querySelector(`.trip-info`);
  return renderComponent(routeElement, new TripInfoComponent(days), RenderPosition.BEFOREEND);
};

const renderEvents = (events, container, onDataChange, onViewChange, isEmptyDate = false) => {
  const pointControllers = [];
  let dates = Array.from(new Set(events.map((item) => new Date(item.dateStart).toDateString())));
  if (isEmptyDate) {
    dates = [1];
  }

  dates.forEach((date, dateIndex) => {
    const dayComponent = !isEmptyDate ? new TripDayComponent(date, dateIndex + 1) : new TripDayComponent();
    const eventsListContainer = dayComponent.getElement().querySelector(`.trip-events__list`);

    events
      .filter((item) => {
        return !isEmptyDate ? new Date(item.dateStart).toDateString() === date : item;
      })
      .forEach((item) => {
        const pointController = new PointController(eventsListContainer, onDataChange, onViewChange);
        pointController.render(item);
        pointControllers.push(pointController);
      });

    renderComponent(container, dayComponent, RenderPosition.BEFOREEND);
  });

  return pointControllers;
};

export default class TripController {
  constructor(container, eventsModel) {
    this._container = container;
    this._eventsModel = eventsModel;
    this._pointControllers = [];

    this._noEventsComponent = new NoEventsComponent();
    this._sortComponent = new SortComponent();
    this._daysListComponent = new TripDaysComponent();

    this._onDataChange = this._onDataChange.bind(this);
    this._onSortTypeChange = this._onSortTypeChange.bind(this);
    this._onViewChange = this._onViewChange.bind(this);

    this._sortComponent.setSortTypeChangeHandler(this._onSortTypeChange);
  }

  render() {
    const events = this._eventsModel.getEvents();
    const container = this._container.getElement();

    if (!events.length) {
      renderComponent(container, this._noEventsComponent, RenderPosition.BEFOREEND);
      return;
    }

    renderComponent(container, this._sortComponent, RenderPosition.BEFOREEND);
    renderComponent(container, this._daysListComponent, RenderPosition.BEFOREEND);
    const daysListElement = this._daysListComponent.getElement();

    renderTripInfo(events);
    this._pointControllers = renderEvents(events, daysListElement, this._onDataChange, this._onViewChange);
  }

  _onDataChange(pointController, oldData, newData) {
    const isSuccess = this._eventsModel.updateEvent(oldData.id, newData);

    if (isSuccess) {
      pointController.render(newData);
    }
  }

  _onViewChange() {
    this._pointControllers.forEach((item) => item.setDefaultView());
  }

  _onSortTypeChange(sortType) {
    let sortedEvents = [];
    const events = this._eventsModel.getEvents();

    switch (sortType) {
      case SortType.PRICE:
        sortedEvents = events.slice().sort((a, b) => b.price - a.price);
        break;
      case SortType.TIME:
        sortedEvents = events.slice().sort((a, b) =>
          Math.abs(b.dateStart.getTime() - b.dateEnd.getTime()) -
          Math.abs(a.dateStart.getTime() - a.dateEnd.getTime()));
        break;
      case SortType.DEFAULT:
        sortedEvents = [];
        break;
    }

    const daysListElement = this._daysListComponent.getElement();
    daysListElement.innerHTML = ``;

    if (sortedEvents.length) {
      this._pointControllers = renderEvents(sortedEvents, daysListElement, this._onDataChange, this._onViewChange, true);
      return;
    }

    this._pointControllers = renderEvents(events, daysListElement, this._onDataChange, this._onViewChange);
  }
}
