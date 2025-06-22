import { TestBed } from '@angular/core/testing';

import { ProductosGrpcService } from './productos-grpc.service';

describe('ProductsGrpcService', () => {
  let service: ProductosGrpcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductosGrpcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
