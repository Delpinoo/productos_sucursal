import { TestBed } from '@angular/core/testing';

import { ProductsGrpcService } from './products-grpc.service';

describe('ProductsGrpcService', () => {
  let service: ProductsGrpcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductsGrpcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
