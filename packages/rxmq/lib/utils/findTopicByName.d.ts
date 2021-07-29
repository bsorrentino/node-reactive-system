import { Subject } from "rxjs";
/**
 * Find a specific subject by given name
 * @param  {Array}                  subjects    Array of subjects to search in
 * @param  {String}                 name        Name to search for
 * @return {(EndlessSubject|void)}              Found subject or void
 */
export declare const findSubjectByName: <T>(subjects: Subject<T>[], name: string) => Subject<T> | undefined;
