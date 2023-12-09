import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewPlaylistPage } from './new-playlist.page';

describe('NewPlaylistPage', () => {
  let component: NewPlaylistPage;
  let fixture: ComponentFixture<NewPlaylistPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(NewPlaylistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
