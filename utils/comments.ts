export function docComments(comments: string[]): string {
	return '/*!\n' + comments.map((comment) => ` * ${comment}`).join('\n') + '\n */';
}
