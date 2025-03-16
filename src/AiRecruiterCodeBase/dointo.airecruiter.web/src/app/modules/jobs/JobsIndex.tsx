import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { PageLink, PageTitle } from "../../../_metronic/layout/core";
import JobsList from "./JobsList";
import JobPost from "./Jobpost";

const jobsBreadCrumbs: Array<PageLink> = [
	{
		title: "Jobs",
		path: "/jobs/post-new",
		isSeparator: false,
		isActive: false,
	},
	{
		title: "",
		path: "",
		isSeparator: true,
		isActive: false,
	},
];

function JobsIndex() {


	return (
		<>
			<PageTitle breadcrumbs={jobsBreadCrumbs}>Job Post</PageTitle>
			<Outlet />

			<Routes>
				<Route path="/" element={<Outlet />}>
					<Route path="list" element={<JobsList />} />
					<Route path="post-new" element={<JobPost />} />
					<Route index element={<Navigate to="/jobs/list" />} />
				</Route>
			</Routes>
		</>
	);
}

export default JobsIndex;