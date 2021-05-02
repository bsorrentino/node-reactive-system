import Rx from 'rx';

/**
 * EndlessSubject extension of Rx.Subject.
 * This is pretty hacky, but so far I'd found no better way of having
 * Subjects that do no close on multicasted stream completion and on multiple errors.
 * For documentation refer to
 * [Rx.Subject docs](@link https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/subjects/subject.md).
 * The only difference is that EndlessSubject never triggers '.onCompleted()' and
 * does not closes observers on errors (thus allowing to continuously dispatch them).
 */
class EndlessSubject extends Rx.Subject {
    /**
     * Dummy method override to prevent execution and Rx.Observable completion
     * @return {void}
     */
    onCompleted() {}

    /**
     * Override of onError method that prevents stopping that Rx.Observer
     * @param  {Error} error  - Error to be dispatched
     * @return {void}
     */
    onError(error) {
        // store error
        this.error = error;
        // dispatch to all observers
        this.observers.forEach(os => {
            // dispatch
            os.onError(error);
            // mark observer as not stopped
            os.isStopped = false;
        });
    }
}

export {EndlessSubject};
