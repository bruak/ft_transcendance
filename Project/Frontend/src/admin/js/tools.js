
export function formatDate(isoString) {
	const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
	const date = new Date(isoString);
	return date.toLocaleString('tr-TR', options); // Türkçe yerel ayar kullanılıyor
}


export async function loadNavbar(elementId, file) {
    try {
        const response = await fetch(file);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(`Error loading ${file}:`, error);
    }
}


