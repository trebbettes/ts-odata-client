/**
 * Represents an OData response with a single entity.
 */
export interface ODataResponse {
    /**
     * Type information about the result(s) returned.
     */
    ["@odata.context"]: string;
}

/**
 * Represents an OData response with 0 or more results.
 */
export interface ODataQueryResponse<U> extends ODataResponse {
    /**
     * If server-side paging is implemented, this will hold the complete URL of the query used to retrieve the next 'page' of results.
     */
    ["@odata.nextLink"]?: string;

    /**
     * The results of the OData query
     */
    value: U[];
}

/**
 * Represnets an OData response with 0 or more results that should also include the total number of items in the results.
 * This value will be different than the number of items in @member {value} if server-side paging is implemented.
 */
export interface ODataQueryResponseWithCount<U> extends ODataQueryResponse<U> {
    ["@odata.count"]?: number;
}

export class GetResult<T> {

    constructor(response: ODataResponse) {
        this.response = response;
    }

    response: ODataResponse;

    getValue(): T {
        return this.response as unknown as T;
    }

}

export class GetManyResult<T, U> {
    
    constructor(response: ODataQueryResponse<U>) {
        this.response = response;
    }
    
    response: ODataQueryResponse<U>;

    getValues(): T[] {
        return this.response.value as unknown as T[];
    }
}