import { type FromLayer, type Layer, makeLayer, type PublicLayer } from '@atom-forge/laminar';
import type { Services } from '#server/application/services/index';
import type { Modules } from '#server/application/modules/index';
import type { Api } from '#server/application/api/index';
import type { Config } from '#server/application/index';
import type { ApiSupport } from '#server/application/api-support/index';

// A rétegek sorrendje: Config → Services → Modules → ApiSupport → Api. Egy réteg csak az alatta lévőket látja.

type ServicesLayer = Layer<[Config], Services, [Config, Services]>;
export const servicesLayer: ServicesLayer = makeLayer<FromLayer<ServicesLayer>>(([config], self) => [config, self]);

type ModulesLayer = Layer<[Config, Services], Modules, [Config, PublicLayer<Services>, Modules]>;
export const modulesLayer: ModulesLayer = makeLayer<FromLayer<ModulesLayer>>(([config, services], self) => [config, services as PublicLayer<Services>, self]);

type ApiSupportLayer = Layer<[Config, Modules], ApiSupport, [Config, PublicLayer<Modules>, ApiSupport]>;
export const apiSupportLayer: ApiSupportLayer = makeLayer<FromLayer<ApiSupportLayer>>(([config, modules], self) => [config, modules as PublicLayer<Modules>, self]);

type ApiLayer = Layer<[Config, Modules, ApiSupport], Api, [Config, PublicLayer<Modules>, PublicLayer<ApiSupport>]>;
export const apiLayer: ApiLayer = makeLayer<FromLayer<typeof apiLayer>>(([config, modules, apiSupport], _self) => [config, modules as PublicLayer<Modules>, apiSupport]);

export const [defineService, serviceCreatorFactory] = servicesLayer;
export const [defineModule, moduleCreatorFactory] = modulesLayer;
export const [defineApiSupport, apiSupportCreatorFactory] = apiSupportLayer;
export const [defineApi, apiCreatorFactory] = apiLayer;
