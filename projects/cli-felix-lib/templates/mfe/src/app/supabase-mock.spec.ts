import { TestBed } from '@angular/core/testing';

import { SupabaseMock } from './supabase-mock';

describe('SupabaseMock', () => {
  let service: SupabaseMock;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupabaseMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
