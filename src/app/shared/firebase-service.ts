// playlist.service.ts

import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  createPlaylist(
    userId: string,
    playlistName: string,
    playlistImage: string
  ): Promise<any> {
    const playlistData = {
      userId: userId,
      name: playlistName,
      image: playlistImage,
    };

    return this.firestore.collection('playlists').add(playlistData);
  }

  getPlaylists(): Observable<any[]> {
    return this.firestore.collection('playlists').valueChanges();
  }

  uploadPlaylistImage(userId: string, file: File): Promise<any> {
    const randomId = Math.random().toString(36).substring(2);

    const filePath = `playlist_images/${userId}_${file.name}_${randomId}`;
    const fileRef = this.storage.ref(filePath);

    return new Promise<string>((resolve, reject) => {
      // Realiza la carga del archivo al almacenamiento
      const task = this.storage.upload(filePath, file);

      // Observa el estado de la tarea y resuelve la Promise cuando se completa
      task
        .snapshotChanges()
        .pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(
              (downloadURL) => {
                // Resuelve la Promise con la URL de descarga
                resolve(downloadURL);
              },
              (error) => {
                // Rechaza la Promise si hay un error al obtener la URL de descarga
                reject(error);
              }
            );
          })
        )
        .subscribe(); // Suscripción para activar la ejecución del observable
    });
  }

  uploadUserImage(userId: string, file: File): Promise<any> {
    const randomId = Math.random().toString(36).substring(2);

    const filePath = `user_images/${userId}`;
    const fileRef = this.storage.ref(filePath);

    return new Promise<string>((resolve, reject) => {
      // Realiza la carga del archivo al almacenamiento
      const task = this.storage.upload(filePath, file);

      // Observa el estado de la tarea y resuelve la Promise cuando se completa
      task
        .snapshotChanges()
        .pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(
              (downloadURL) => {
                // Resuelve la Promise con la URL de descarga
                resolve(downloadURL);
              },
              (error) => {
                // Rechaza la Promise si hay un error al obtener la URL de descarga
                reject(error);
              }
            );
          })
        )
        .subscribe(); // Suscripción para activar la ejecución del observable
    });
  }
}
