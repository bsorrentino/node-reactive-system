'use strict';


const sleep = (ms:number) => new Promise(resolve => setTimeout(resolve, ms))

const immediate = () => new Promise(resolve => setImmediate(resolve))

const JEST_TIMEOUT = 10000

jest.setTimeout(JEST_TIMEOUT)

describe( 'module http test', () => {
    
    test( 'test parse pathname', () => {

        const result = /\/channel\/([\w.]+)[\/]?/.exec('/channel/wsmain/')

        expect( result ).not.toBeNull()
        expect( result![1] ).toEqual( 'wsmain')

    })

})