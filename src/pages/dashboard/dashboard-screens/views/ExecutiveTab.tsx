import React from "react";
import { GlobalFilterValues } from "../../dashboard-screens/GlobalFilters";
import StatsRowOne from "../../dashboard-screens/StatsRowOne";
import StatsRowTwo from "../../dashboard-screens/StatsRowTwo";
import StatsRowThree from "../../dashboard-screens/StatsRowThree";
import StatsRowFour from "../../dashboard-screens/StatsRowFour";
import StatsRowFive from "../../dashboard-screens/StatsRowFive";
import TopRankingsRow from "../../dashboard-screens/TopRankingsRow";

interface Props {
    filters: GlobalFilterValues;
}

const ExecutiveTab: React.FC<Props> = ({ filters }) => {
    return (
        <div>
            <StatsRowOne filters={filters} />
            <StatsRowTwo />
            <StatsRowThree />
            <StatsRowFive />
            <TopRankingsRow />
            <StatsRowFour />
        </div>
    );
};

export default ExecutiveTab;
