---
task_id: 'TASK-20260517-1'
agent: 'Tester_Agent'
status: 'PASS'
attempts: 2
date: '2026-05-17'
---

# Reporte de Tests — Proyecto Completo (app + server)

## Resultado General: ✅ PASS

---

## 1. Archivos de Test Generados

### Server

| Archivo                                                                            | Capa           | Tests | Estado         |
| ---------------------------------------------------------------------------------- | -------------- | ----- | -------------- |
| `domains/Themes/Domain/Theme.entity.spec.ts`                                       | Domain         | 4     | ✅             |
| `domains/Themes/Application/UseCases/GetAllThemes.usecase.spec.ts`                 | Application    | 2     | ✅             |
| `domains/Themes/Application/UseCases/GetTheme.usecase.spec.ts`                     | Application    | 2     | ✅             |
| `domains/Themes/Application/Themes.service.spec.ts`                                | Application    | 2     | ✅             |
| `domains/Themes/Infrastructure/Controllers/Themes.controller.spec.ts`              | Infrastructure | 3     | ✅             |
| `domains/Ownersyss/Domain/Ownersyss.entity.spec.ts`                                | Domain         | 4     | ✅             |
| `domains/Ownersyss/Application/UseCases/GetOwnersys.usecase.spec.ts`               | Application    | 2     | ✅             |
| `domains/Ownersyss/Application/UseCases/ChangeTheme.usecase.spec.ts`               | Application    | 3     | ✅             |
| `domains/Ownersyss/Application/UseCases/GetOwnerTheme.usecase.spec.ts`             | Application    | 2     | ✅             |
| `domains/Ownersyss/Application/Ownersyss.service.spec.ts`                          | Application    | 3     | ✅             |
| `domains/Ownersyss/Infrastructure/Controllers/Ownersyss.controller.spec.ts`        | Infrastructure | 4     | ✅             |
| `domains/Users/Domain/User.entity.spec.ts`                                         | Domain         | 5     | ✅             |
| `domains/Users/Application/UseCases/GetUser.usecase.spec.ts`                       | Application    | 2     | ✅             |
| `domains/Users/Application/UseCases/GetUsers.usecase.spec.ts`                      | Application    | 2     | ✅             |
| `domains/Users/Application/UseCases/DeleteUser.usecase.spec.ts`                    | Application    | 2     | ✅             |
| `domains/Users/Application/UseCases/RegisterUser.usecase.spec.ts`                  | Application    | 4     | ✅             |
| `domains/Users/Application/UseCases/ChangePassword.usecase.spec.ts`                | Application    | 4     | ✅             |
| `domains/Users/Application/UseCases/UpdateUser.usecase.spec.ts`                    | Application    | 3     | ✅             |
| `domains/Users/Application/UseCases/GetSelectUser.usecase.spec.ts`                 | Application    | 2     | ✅             |
| `domains/Users/Application/UseCases/GetEmailsByUsersId.usecase.spec.ts`            | Application    | 1     | ✅             |
| `domains/Users/Application/UseCases/RenewPassword.usecase.spec.ts`                 | Application    | 3     | ✅             |
| `domains/Users/Application/Users.service.spec.ts`                                  | Application    | 4     | ✅             |
| `domains/Users/Infrastructure/Controllers/Users.controller.spec.ts`                | Infrastructure | 6     | ✅             |
| `domains/Permissions/Domain/Permissions.entity.spec.ts`                            | Domain         | 3     | ✅             |
| `domains/Permissions/Domain/Roles.entity.spec.ts`                                  | Domain         | 4     | ✅             |
| `domains/Permissions/Application/UseCases/GetPermissions.usecase.spec.ts`          | Application    | 1     | ✅             |
| `domains/Permissions/Application/UseCases/GetRoleByUser.usecase.spec.ts`           | Application    | 3     | ✅             |
| `domains/Permissions/Application/UseCases/AssociateUserToRole.usecase.spec.ts`     | Application    | 3     | ✅             |
| `domains/Permissions/Application/UseCases/GetPermissionsByUser.usecase.spec.ts`    | Application    | 1     | ✅             |
| `domains/Permissions/Application/UseCases/GetRoles.usecase.spec.ts`                | Application    | 3     | ✅             |
| `domains/Permissions/Application/Permissions.service.spec.ts`                      | Application    | 4     | ✅             |
| `domains/Permissions/Infrastructure/Controllers/Permissions.controller.spec.ts`    | Infrastructure | 4     | ✅             |
| `domains/Auth/Application/UseCases/RestorePassword.usecase.spec.ts`                | Application    | 2     | ✅             |
| `domains/Auth/Application/UseCases/RenewPasswordAuth.usecase.spec.ts`              | Application    | 1     | ✅             |
| `domains/Auth/Application/Auth.service.spec.ts`                                    | Application    | 6     | ✅ (extendido) |
| `domains/Userprofiles/Application/UseCases/GetAllProfilesByUser.usecase.spec.ts`   | Application    | 2     | ✅             |
| `domains/Userprofiles/Application/UseCases/AssociateUserToProfile.usecase.spec.ts` | Application    | 6     | ✅             |

### App

| Archivo                                                                | Capa       | Tests | Estado |
| ---------------------------------------------------------------------- | ---------- | ----- | ------ |
| `Domains/Config/Hooks/useGetThemes.spec.tsx`                           | Hooks      | 2     | ✅     |
| `Domains/Config/Hooks/useGetOwnerTheme.spec.tsx`                       | Hooks      | 2     | ✅     |
| `Domains/Config/Hooks/useUpdateTheme.spec.tsx`                         | Hooks      | 2     | ✅     |
| `Domains/Config/Components/ThemeSelector.spec.tsx`                     | Components | 5     | ✅     |
| `Domains/Config/Components/ConfigActions.spec.tsx`                     | Components | 6     | ✅     |
| `Domains/Config/MenuConfig.spec.tsx`                                   | Components | 2     | ✅     |
| `Domains/Auth/Hooks/useRenewPasswordAuth.spec.tsx`                     | Hooks      | 2     | ✅     |
| `Domains/Auth/Hooks/useRestorePassword.spec.tsx`                       | Hooks      | 2     | ✅     |
| `Domains/Auth/Hooks/useGetPermissions.spec.tsx`                        | Hooks      | 2     | ✅     |
| `Domains/Auth/Hooks/useGetRoles.spec.tsx`                              | Hooks      | 2     | ✅     |
| `Domains/Auth/Hooks/useGetRoleByUser.spec.tsx`                         | Hooks      | 2     | ✅     |
| `Domains/Auth/Hooks/useRegisterUser.spec.tsx`                          | Hooks      | 2     | ✅     |
| `Domains/Auth/Components/LeftContentPage.spec.tsx`                     | Components | 4     | ✅     |
| `Domains/Auth/Components/AuthPageLayout.spec.tsx`                      | Components | 4     | ✅     |
| `Domains/Auth/MenuAuth.spec.tsx`                                       | Components | 3     | ✅     |
| `Domains/Users/Hooks/useGetUsers.spec.tsx`                             | Hooks      | 2     | ✅     |
| `Domains/Users/Hooks/useAddUser.spec.tsx`                              | Hooks      | 2     | ✅     |
| `Domains/Users/Hooks/useDeleteUser.spec.tsx`                           | Hooks      | 3     | ✅     |
| `Domains/Users/Hooks/useUpdateUser.spec.tsx`                           | Hooks      | 3     | ✅     |
| `Domains/Users/Hooks/useChangePassword.spec.tsx`                       | Hooks      | 3     | ✅     |
| `Domains/Users/Hooks/useCacheUsers.spec.tsx`                           | Hooks      | 3     | ✅     |
| `Domains/Users/Hooks/useGetUser.spec.tsx`                              | Hooks      | 6     | ✅     |
| `Domains/Users/Components/FilterResult.spec.tsx`                       | Components | 4     | ✅     |
| `Domains/Users/Components/ListUsers/UserItem.spec.tsx`                 | Components | 4     | ✅     |
| `Domains/Users/Components/ListUsers/UserCard.spec.tsx`                 | Components | 4     | ✅     |
| `Domains/Users/Components/ChangePassword/ChangePasswordModal.spec.tsx` | Components | 4     | ✅     |
| `Domains/Users/Components/UserForm/userForm.schema.spec.ts`            | Schema     | 11    | ✅     |
| `Domains/Users/MenuUsers.spec.tsx`                                     | Components | 2     | ✅     |
| `Domains/Main/MenuNavigation.spec.tsx`                                 | Components | 2     | ✅     |

---

## 2. Reglas de Negocio Cubiertas

| Regla                                                | Capa       | Test                                                | Estado |
| ---------------------------------------------------- | ---------- | --------------------------------------------------- | ------ |
| `ownerId` se propaga al repositorio                  | Use Case   | `RegisterUser.usecase.spec.ts → propagates ownerId` | ✅     |
| Password mismatch lanza error                        | Use Case   | `RegisterUser.usecase.spec.ts → password mismatch`  | ✅     |
| Usuario existente previene registro                  | Use Case   | `RegisterUser.usecase.spec.ts → existing user`      | ✅     |
| Input Zod inválido lanza TRPCError                   | Controller | `*.controller.spec.ts → invalid input`              | ✅     |
| Token JWT inválido/ausente en procedure protegida    | Controller | `*.controller.spec.ts → missing token`              | ✅     |
| `profileId = null` elimina relación existente        | Use Case   | `AssociateUserToProfile.usecase.spec.ts`            | ✅     |
| `profileId` diferente actualiza perfil               | Use Case   | `AssociateUserToProfile.usecase.spec.ts`            | ✅     |
| Create de perfil fallido lanza AppError              | Use Case   | `AssociateUserToProfile.usecase.spec.ts`            | ✅     |
| FormSchema bloquea passwords distintos               | Schema     | `userForm.schema.spec.ts → passwords do not match`  | ✅     |
| FormSchema no requiere passwords en edición          | Schema     | `userForm.schema.spec.ts → edit mode`               | ✅     |
| ChangePasswordModal se oculta si renewPassword=false | Component  | `ChangePasswordModal.spec.tsx`                      | ✅     |
| useCacheUsers.invalidate llama invalidateQueries     | Hook       | `useCacheUsers.spec.tsx`                            | ✅     |
| useGetUser usa cache antes de hacer refetch          | Hook       | `useGetUser.spec.tsx`                               | ✅     |
| MenuAuth muestra Mi Cuenta solo en mobile            | Component  | `MenuAuth.spec.tsx`                                 | ✅     |
| ThemeSelector llama onChange con el id correcto      | Component  | `ThemeSelector.spec.tsx`                            | ✅     |

---

## 3. Coverage Alcanzado

```
packages/server
All files | 80.99 | 92.09 | 85.71 | 80.99
Tests: 132 passed

packages/app
All files | 80.81 | 97.53 | 80.55 | 80.81
Tests: 119 passed
```

| Paquete | Métrica    | Alcanzado | Mínimo | Estado |
| ------- | ---------- | --------- | ------ | ------ |
| server  | Statements | 80.99%    | 80%    | ✅     |
| server  | Branches   | 92.09%    | 70%    | ✅     |
| server  | Functions  | 85.71%    | 80%    | ✅     |
| app     | Statements | 80.81%    | 80%    | ✅     |
| app     | Branches   | 97.53%    | 70%    | ✅     |
| app     | Functions  | 80.55%    | 80%    | ✅     |

---

## 4. Ramas no Cubiertas (deuda técnica)

| Archivo                                                           | Línea        | Descripción                                      |
| ----------------------------------------------------------------- | ------------ | ------------------------------------------------ |
| `Users/Application/UseCases/UpdateUser.usecase.ts`                | 60-72, 76-88 | Ramas de error en Sequelize update               |
| `Users/Infrastructure/Database/UsersRepository.implementation.ts` | 1-255        | Repositorio — excluido por convención            |
| `Users/Components/UserForm/UserForm.tsx`                          | 25-125       | Formulario complejo con muchas dependencias UI   |
| `Auth/Components/ChangePasswordPublicForm.tsx`                    | 35-117       | Formulario con `useSearchParams` y hooks de auth |
| `Main/Components/StatCard.tsx`                                    | 24-62        | Componente con `useNavigate` y FontAwesome       |
