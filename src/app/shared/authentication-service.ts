import { Injectable, NgZone } from '@angular/core';
import * as auth from 'firebase/auth';
import { User } from './user';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, finalize } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  userData: any;
  constructor(
    public afStore: AngularFirestore,
    private storage: AngularFireStorage,
    public ngFireAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone
  ) {
    this.ngFireAuth.authState.subscribe((user) => {
      if (user) {
        // En caso de que tenga iniciada sesion
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user') || '{}');

        if (
          router.url === '/home' ||
          router.url === '/login' ||
          router.url === '/register'
        ) {
          router.navigate(['dashboard']);
        }
      } else {
        // En caso de que no tenga iniciada sesion

        localStorage.setItem('user', undefined as any);
        localStorage.removeItem('user');
        JSON.parse(localStorage.getItem('user') || '{}');

        if (
          router.url !== '/home' &&
          router.url !== '/login' &&
          router.url !== '/register'
        ) {
          router.navigate(['home']);
        }
      }
    });
  }
  // Login in with email/password
  SignIn(email: any, password: any) {
    return this.ngFireAuth.signInWithEmailAndPassword(email, password);
  }
  // Register user with email/password
  RegisterUser(email: string, password: string, displayName: string) {
    return this.ngFireAuth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Usuario creado con éxito
        const user: any = userCredential.user;

        // Actualiza el nombre de visualización (display name) del usuario
        user
          .updateProfile({
            displayName: displayName,
          })
          .then(() => {
            // Actualización exitosa
            console.log(
              'Usuario creado exitosamente con nombre de visualización:',
              displayName
            );
          })
          .catch((error: any) => {
            // Error al actualizar el nombre de visualización
            console.error(
              'Error al actualizar el nombre de visualización:',
              error.message
            );
          });
      })
      .catch((error) => {
        // Error al crear el usuario
        console.error('Error al crear el usuario:', error.message);
      });
  }
  // Email verification when new user register
  SendVerificationMail() {
    return this.ngFireAuth.currentUser.then((user: any) => {
      return user.sendEmailVerification().then(() => {
        // this.router.navigate(['login']);
      });
    });
  }
  // Recover password
  PasswordRecover(passwordResetEmail: any) {
    return this.ngFireAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert(
          'Password reset email has been sent, please check your inbox.'
        );
      })
      .catch((error) => {
        window.alert(error);
      });
  }
  // Returns true when user is looged in
  get isLoggedIn(): boolean {
    if (localStorage.getItem('user') === null) {
      return false;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user !== null && user.emailVerified !== false ? true : false;
  }
  // Returns true when user's email is verified
  get isEmailVerified(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.emailVerified !== false ? true : false;
  }
  // Sign in with Gmail
  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider());
  }
  // Auth providers
  AuthLogin(provider: any) {
    return this.ngFireAuth
      .signInWithPopup(provider)
      .then((result) => {
        this.ngZone.run(() => {
          this.SetUserData(result.user);
        });
      })
      .catch((error) => {
        window.alert(error);
      });
  }
  // Store user in localStorage
  SetUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afStore.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    return userRef.set(userData, {
      merge: true,
    });
  }
  // Sign-out
  SignOut() {
    return this.ngFireAuth.signOut().then(() => {
      localStorage.removeItem('user');
    });
  }

  uploadPlaylistImage(userId: string, playlistId: string, file: File): any {
    const filePath = `playlist_images/${userId}/${playlistId}_${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    // Puedes observar el progreso del upload si es necesario
    // const percentage = task.percentageChanges();

    return task.snapshotChanges().pipe(
      // Finalización del upload
      finalize(() => {
        fileRef.getDownloadURL().subscribe((downloadURL) => {
          console.log('File available at', downloadURL);
          return downloadURL;
        });
      })
    );
  }
}
