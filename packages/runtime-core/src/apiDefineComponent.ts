import {
  ComputedOptions,
  MethodOptions,
  ComponentOptionsWithoutProps,
  ComponentOptionsWithArrayProps,
  ComponentOptionsWithObjectProps,
  ComponentOptionsMixin,
  RenderFunction,
  ComponentOptionsBase
} from './componentOptions'
import {
  SetupContext,
  AllowedComponentProps,
  ComponentCustomProps
} from './component'
import {
  ExtractPropTypes,
  ComponentPropsOptions,
  ExtractDefaultPropTypes
} from './componentProps'
import { EmitsOptions } from './componentEmits'
import { isFunction } from '@vue/shared'
import { VNodeProps } from './vnode'
import {
  CreateComponentPublicInstance,
  ComponentPublicInstanceConstructor
} from './componentPublicInstance'

// Vue 组件通用的 props
export type PublicProps = VNodeProps &
  AllowedComponentProps &
  ComponentCustomProps

// 作为 defineComponent 函数所返回的类型
export type DefineComponent<
  PropsOrPropOptions = {}, // 用于定义组件的 props
  RawBindings = {}, // 如果 setup 函数返回一个对象，该对象的类型由 RawBindings 定义
  D = {}, // 组件的 data 函数返回的对象
  C extends ComputedOptions = ComputedOptions, // 组件的 computed 配置项的定义
  M extends MethodOptions = MethodOptions, // 组件的 methods 对象中的函数的定义
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, // mixin 关键字定义的配置项
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin, // extends 关键字定义的配置项
  E extends EmitsOptions = Record<string, any>, // 如果组件有 emit 内容，可以通过 EmitsOptions 来定义这些 emit 的事件
  EE extends string = string,
  PP = PublicProps,
  Props = Readonly<ExtractPropTypes<PropsOrPropOptions>>,
  Defaults = ExtractDefaultPropTypes<PropsOrPropOptions>
> = ComponentPublicInstanceConstructor<
  CreateComponentPublicInstance<
    Props,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    PP & Props,
    Defaults,
    true
  > &
    Props
> &
  ComponentOptionsBase<
    Props,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE,
    Defaults
  > &
  PP

// defineComponent is a utility that is primarily used for type inference
// when declaring components. Type inference is provided in the component
// options (provided as the argument). The returned value has artificial types
// for TSX / manual render function / IDE support.

// 使用了4个重载，接受4种不同的传参方式

// overload 1: direct setup function
// (uses user defined props interface)

// 重载1：直接接收一个 setup 函数
// RawBindings：setup 函数中如果返回了一个对象，该对象会被绑定到 this，因此在模板中是可以调用的。
export function defineComponent<Props, RawBindings = object>(
  setup: (
    props: Readonly<Props>,
    ctx: SetupContext
  ) => RawBindings | RenderFunction
): DefineComponent<Props, RawBindings>

// overload 2: object format with no props
// (uses user defined props interface)
// return type is for Vetur and TSX support

// 重载2：通过对象创建组件，但是没传 props
export function defineComponent<
  Props = {},
  RawBindings = {},
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = EmitsOptions,
  EE extends string = string
>(
  options: ComponentOptionsWithoutProps<
    Props,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE
  >
): DefineComponent<Props, RawBindings, D, C, M, Mixin, Extends, E, EE>

// overload 3: object format with array props declaration
// props inferred as { [key in PropNames]?: any }
// return type is for Vetur and TSX support

// 重载3：通过对象创建组件，并且通过数组方式声明 props
// 类似这种：{ props: ['name', 'age', 'xxx'] }
export function defineComponent<
  PropNames extends string,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = Record<string, any>,
  EE extends string = string
>(
  options: ComponentOptionsWithArrayProps<
    PropNames,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE
  >
): DefineComponent<
  Readonly<{ [key in PropNames]?: any }>,
  RawBindings,
  D,
  C,
  M,
  Mixin,
  Extends,
  E,
  EE
>

// overload 4: object format with object props declaration
// see `ExtractPropTypes` in ./componentProps.ts

// 重载4：通过对象创建组件，并且通过对象方式声明 props（最为推荐）。
// 类似这种：
// {
//   props: {
//     name: {
//       type: String,
//       required: true
//     }
//   }
// }
export function defineComponent<
  // the Readonly constraint allows TS to treat the type of { required: true }
  // as constant instead of boolean.
  PropsOptions extends Readonly<ComponentPropsOptions>,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = Record<string, any>,
  EE extends string = string
>(
  options: ComponentOptionsWithObjectProps<
    PropsOptions,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE
  >
): DefineComponent<PropsOptions, RawBindings, D, C, M, Mixin, Extends, E, EE>

// implementation, close to no-op

// defineComponent 函数的具体实现
// 作用：给 TS 用的，用来生成定义的，对于用 TS 写 Vue3 非常重要
// 如果传入一个函数，那么返回包装后的对象，传入的函数名将作为组件名使用
// 如果传入一个对象，就直接返回这个对象
export function defineComponent(options: unknown) {
  return isFunction(options) ? { setup: options, name: options.name } : options
}
