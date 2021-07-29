/**
 * Compares given topic with existing topic
 * @param  {String}  topic         Topic name
 * @param  {String}  existingTopic Topic name to compare to
 * @return {Boolean}               Whether topic is included in existingTopic
 * @example
 * should(compareTopics('test.one.two', 'test.#')).equal(true);
 * @private
 */
export declare const compareTopics: (topic: string, existingTopic: string) => boolean;
