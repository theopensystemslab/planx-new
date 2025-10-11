// When a source template is published, it automatically updates each templated flows data and automatically inserts a comment into its' History timeline
export const isAutoComment = (comment: string): boolean => {
  return comment.startsWith("Source template published:");
};
