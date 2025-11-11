/**
 * Test de l'entité User
 */

import { User, UserRole, UserProps } from '@/core/entities/User';

describe('User Entity', () => {
  const validUserProps: UserProps = {
    id: 1,
    userId: 'auth-123',
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.com',
    numeroTel: '+237612345678',
    role: UserRole.STUDENT,
  };

  describe('Création', () => {
    it('devrait créer un utilisateur valide', () => {
      const user = new User(validUserProps);

      expect(user.id).toBe(1);
      expect(user.nom).toBe('Dupont');
      expect(user.prenom).toBe('Jean');
      expect(user.fullName).toBe('Jean Dupont');
      expect(user.role).toBe(UserRole.STUDENT);
    });

    it('devrait rejeter un email invalide', () => {
      const invalidProps = {
        ...validUserProps,
        email: 'email-invalide',
      };

      expect(() => new User(invalidProps)).toThrow('Email invalide');
    });

    it('devrait rejeter un nom vide', () => {
      const invalidProps = {
        ...validUserProps,
        nom: '',
      };

      expect(() => new User(invalidProps)).toThrow('Le nom est requis');
    });

    it('devrait rejeter un prénom vide', () => {
      const invalidProps = {
        ...validUserProps,
        prenom: '   ',
      };

      expect(() => new User(invalidProps)).toThrow('Le prénom est requis');
    });

    it('devrait rejeter un rôle invalide', () => {
      const invalidProps = {
        ...validUserProps,
        role: 'RoleInvalide' as UserRole,
      };

      expect(() => new User(invalidProps)).toThrow('Rôle invalide');
    });
  });

  describe('Méthodes métier', () => {
    it('devrait identifier un étudiant', () => {
      const student = new User({ ...validUserProps, role: UserRole.STUDENT });
      
      expect(student.isStudent()).toBe(true);
      expect(student.isStaff()).toBe(false);
      expect(student.isAdmin()).toBe(false);
    });

    it('devrait identifier un gérant', () => {
      const staff = new User({ ...validUserProps, role: UserRole.STAFF });
      
      expect(staff.isStudent()).toBe(false);
      expect(staff.isStaff()).toBe(true);
      expect(staff.isAdmin()).toBe(false);
    });

    it('devrait identifier un admin', () => {
      const admin = new User({ ...validUserProps, role: UserRole.ADMIN });
      
      expect(admin.isStudent()).toBe(false);
      expect(admin.isStaff()).toBe(false);
      expect(admin.isAdmin()).toBe(true);
    });

    it('un étudiant ne peut pas gérer de restaurant', () => {
      const student = new User({ ...validUserProps, role: UserRole.STUDENT });
      
      expect(student.canManageRestaurant()).toBe(false);
    });

    it('un gérant peut gérer un restaurant', () => {
      const staff = new User({ ...validUserProps, role: UserRole.STAFF });
      
      expect(staff.canManageRestaurant()).toBe(true);
    });

    it('un admin peut gérer un restaurant', () => {
      const admin = new User({ ...validUserProps, role: UserRole.ADMIN });
      
      expect(admin.canManageRestaurant()).toBe(true);
    });

    it('un gérant peut gérer les commandes', () => {
      const staff = new User({ ...validUserProps, role: UserRole.STAFF });
      
      expect(staff.canManageOrders()).toBe(true);
    });
  });

  describe('Sérialisation', () => {
    it('devrait convertir en objet simple', () => {
      const user = new User(validUserProps);
      const obj = user.toObject();

      expect(obj).toEqual(validUserProps);
    });
  });
});
