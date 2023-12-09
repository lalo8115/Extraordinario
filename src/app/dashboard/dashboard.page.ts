import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../shared/authentication-service';
import { Router } from '@angular/router';
import { FirebaseService } from '../shared/firebase-service';
import { ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;

  playlists: Array<any>;
  playlistName: string;
  imageFile: File | null = null;
  imageError: string | null = null;
  uploadingImage = false;
  isLoading = false;
  timeSeed = Date.now();

  DEFAULT_USER_IMAGE =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Windows_10_Default_Profile_Picture.svg/2048px-Windows_10_Default_Profile_Picture.svg.png';

  constructor(
    public authService: AuthenticationService,
    public router: Router,
    public firebaseService: FirebaseService
  ) {}

  ngOnInit(): void {
    this.firebaseService.getPlaylists().subscribe((playlists) => {
      this.playlists = playlists.filter(
        (playlist) => playlist.userId === this.authService.userData.uid
      );
    });
  }

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

      this.firebaseService
        .uploadUserImage(this.authService.userData.uid, file)
        .then((downloadURL) => {
          this.authService.userData.image = downloadURL;
          this.timeSeed = Date.now();
        });
    }
  }

  triggerFileInputClick() {
    this.fileInput.nativeElement.click();
  }
}
