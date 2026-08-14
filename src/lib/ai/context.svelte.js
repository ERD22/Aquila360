export const aiContext = $state({
	page: '',
	data: null,
	summary: ''
});

export function setAiContext(page, data = null, summary = '') {
	aiContext.page = page;
	aiContext.data = data;
	aiContext.summary = summary;
}
