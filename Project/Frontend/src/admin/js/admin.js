import { initializeSideNavbar } from "/admin/js/sideNavbar.js";
import { initializeTopNavbar } from "/admin/js/topNavbar.js";
import { router } from "/js/app.js";


async function Rol() {
	const accessToken = localStorage.getItem("accessToken");
	const host = window.location.host;
	const apiBaseUrl = `https://${host}/api/`;

	const response = await fetch(`${apiBaseUrl}auth/validate_admin/`,
	{
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Accept-Language': localStorage.getItem('language'),
			'Authorization': `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		if (localStorage.getItem("accessToken") && localStorage.getItem('username'))
			history.pushState(null,null,`/profile/${localStorage.getItem('username')}`);
		else
			history.pushState(null,null,`/`);
		router();
	}
	const responseJson = await response.json(); // API'den dönen yanıt
	const RoleGuard = responseJson.data;
	return RoleGuard.valid;	
}

export async function initAdmin() {
	const status = await Rol();
	await initializeTopNavbar();
	await initializeSideNavbar();
}

