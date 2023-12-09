import { Component, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { AuthenticationService } from '../shared/authentication-service';
import { Router } from '@angular/router';
import { FirebaseService } from '../shared/firebase-service';
import { ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-new-playlist',
  templateUrl: './new-playlist.page.html',
  styleUrls: ['./new-playlist.page.scss'],
})
export class NewPlaylistPage implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;

  playlistName: string;
  playlists: Array<any>;
  imageFile: File | null = null;
  imageError: string | null = null;
  uploadingImage = false;
  isLoading = false;

  constructor(
    public authService: AuthenticationService,
    public router: Router,
    public firebaseService: FirebaseService
  ) {}

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    const file = event?.target?.files[0];

    if (file) {
      // Validar el tipo de archivo (opcional)
      if (!file.type.startsWith('image/')) {
        this.imageError = 'Por favor, selecciona un archivo de imagen válido.';
        return;
      }

      // Validar el tamaño de la imagen (opcional)
      if (file.size > 5242880) {
        // 5 MB en bytes
        this.imageError =
          'La imagen es demasiado grande. Selecciona una imagen más pequeña.';
        return;
      }

      this.imageFile = file;
      this.imageError = null;
    }
  }

  triggerFileInputClick() {
    this.fileInput.nativeElement.click();
  }

  createPlaylist(): void {
    console.log('hola');

    this.isLoading = true;

    const userId = this.authService.userData.uid;

    console.log({ userId, playlistName: this.playlistName });

    if (this.imageFile !== null) {
      this.firebaseService
        .uploadPlaylistImage(userId, this.imageFile)
        .then((data) => {
          console.log({ data });

          if (userId && this.playlistName) {
            this.firebaseService
              .createPlaylist(userId, this.playlistName, data)
              .then(() => {
                console.log('Playlist creada exitosamente');
                this.isLoading = false;
                this.router.navigate(['dashboard']);
              })
              .catch((error) => {
                console.error('Error al crear la playlist:', error);
              });
          }
        })
        .catch((error) => {
          console.error({ error });
        });
    }
  }
}
