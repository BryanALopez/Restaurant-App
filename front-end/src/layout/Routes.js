import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import ReservationsFormComponent from "../reservations/FormComponent";
import Seat from "../reservations/Seat";
import TablesFormComponent from "../tables/FormComponent";
import Search from "../search/Search";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/dashboard">
        <Dashboard/>
      </Route>
      <Route path="/reservations/new">
        <ReservationsFormComponent what={"new"} />
      </Route>
      <Route path="/reservations/:reservation_id/seat">
        <Seat/>
      </Route>
      <Route path="/reservations/:reservation_id/edit">
        <ReservationsFormComponent what={"edit"} />
      </Route>
      <Route path="/tables/new">
        <TablesFormComponent what={"new"} />
      </Route>
      <Route path="/search">
        <Search />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
