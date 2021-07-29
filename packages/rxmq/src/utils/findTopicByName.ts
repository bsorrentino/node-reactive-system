import { Subject } from "rxjs";

/**
 * Find a specific subject by given name
 * @param  {Array}                  subjects    Array of subjects to search in
 * @param  {String}                 name        Name to search for
 * @return {(EndlessSubject|void)}              Found subject or void
 */
export const findSubjectByName = <T>(subjects: Array<Subject<T>>, name: string) => 
  subjects.find(s => name === Object.getOwnPropertyDescriptor( s, 'name' )?.value )

