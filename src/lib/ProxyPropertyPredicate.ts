import { BooleanPredicateBuilder } from "./BooleanPredicateBuilder";
import { Expression } from "./Expression";
import { ExpressionOperator } from "./ExpressionOperator";
import { FieldReference } from "./FieldReference";
import { FilterAccessoryFunctions } from "./FilterAccessoryFunctions";
import { Literal } from "./Literal";
import { ODataQueryProvider } from "./ODataQueryProvider";
import { ODataType } from "./ODataType";
import { ArrayProxyFieldPredicateInterface, EqualityProxyFieldPredicate, InequalityProxyFieldPredicate, PredicateArgument, StringProxyFieldPredicateInterface, createProxiedEntity } from "./ProxyFilterTypes";
import { EntityProxy, propertyPath, lambdaVariable, PropertyProxy } from "./ProxyTypes";

export class ProxyPropertyPredicate<T> implements
    EqualityProxyFieldPredicate<T>,
    InequalityProxyFieldPredicate<T>,
    StringProxyFieldPredicateInterface,
    ArrayProxyFieldPredicateInterface {
    private readonly fieldReference: FieldReference<T>;

    constructor(propertyProxy: PropertyProxy<T>, private readonly provider: ODataQueryProvider) {
        this.fieldReference = this.getFieldReference(propertyProxy);
    }

    equals(value: PredicateArgument<T>, type: ODataType | null = null) {
        return this.buildPredicateBuilder(value, ExpressionOperator.Equals, type);
    }
    
    notEquals(value: PredicateArgument<T>, type: ODataType | null = null) {
        return this.buildPredicateBuilder(value, ExpressionOperator.NotEquals, type);
    }

    in(value: ArrayLike<PredicateArgument<T>> | Iterable<PredicateArgument<T>>) {
        return this.buildPredicateBuilder(Array.from(value), ExpressionOperator.In);
    }

    lessThan(value: PredicateArgument<T>, type: ODataType | null = null) {
        return this.buildPredicateBuilder(value, ExpressionOperator.LessThan, type);
    }

    lessThanOrEqualTo(value: PredicateArgument<T>, type: ODataType | null = null) {
        return this.buildPredicateBuilder(value, ExpressionOperator.LessThanOrEqualTo, type);
    }

    greaterThan(value: PredicateArgument<T>, type: ODataType | null = null) {
        return this.buildPredicateBuilder(value, ExpressionOperator.GreaterThan, type);
    }

    greaterThanOrEqualTo(value: PredicateArgument<T>, type: ODataType | null = null) {
        return this.buildPredicateBuilder(value, ExpressionOperator.GreaterThanOrEqualTo, type);
    }

    contains(value: PredicateArgument<string>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.Contains);
    }

    startsWith(value: PredicateArgument<string>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.StartsWith);
    }

    endsWith(value: PredicateArgument<string>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.EndsWith);
    }

    any<U>(value: (entity: EntityProxy<U, true>, compound: FilterAccessoryFunctions<U>) => BooleanPredicateBuilder<U[]>) {
        const proxy = this.provider[createProxiedEntity]<U>(true);
        const expression = value(proxy, new FilterAccessoryFunctions<U>()).expression;

        return this.buildCollectionFilterPredicateBuilder(expression!, ExpressionOperator.Any, proxy);
    }

    all<U>(value: (entity: EntityProxy<U, true>, compound: FilterAccessoryFunctions<U>) => BooleanPredicateBuilder<U[]>) {
        const proxy = this.provider[createProxiedEntity]<U>(true);
        const expression = value(proxy, new FilterAccessoryFunctions<U>()).expression;

        return this.buildCollectionFilterPredicateBuilder(expression!, ExpressionOperator.All, proxy);
    }

    private buildCollectionFilterPredicateBuilder<P>(value: Expression, operator: ExpressionOperator, proxy: EntityProxy<P>) {
        let operand: any = value;
        const propertyPaths = value == null ? null : (value as any)[propertyPath] as string[] | undefined;
        if (propertyPaths != null) {
            operand = this.getFieldReference(value as unknown as PropertyProxy<T>)
        }
        const expression = new Expression(operator, [this.fieldReference, new String(proxy[lambdaVariable]), operand]);
        return new BooleanPredicateBuilder<P>(expression);
    }

    protected buildPredicateBuilder<P>(value: P | PropertyProxy<P>, operator: ExpressionOperator, type: ODataType | null = null) {
        let operand: any = value;
        const propertyPaths = value == null ? null : (value as any)[propertyPath] as string[] | undefined;
        if (propertyPaths != null) {
            operand = this.getFieldReference(value as unknown as PropertyProxy<T>)
        }
        if (type != null) {
            operand = new Literal(operand, type);
        }
        const expression = new Expression(operator, [this.fieldReference, operand]);
        return new BooleanPredicateBuilder<P>(expression);
    }

    private getFieldReference(propertyProxy: PropertyProxy<T>) {
        const propertyPaths = propertyProxy[propertyPath];
        // TODO: Better handle typing here
        return new FieldReference(propertyPaths.join('/')) as unknown as FieldReference<T>;
    }
}