# Security Specification for Quran Circle Management System

## 1. Data Invariants
1. Only authenticated users whose `request.auth.uid` exists in `/teachers/{uid}` with `active == true` are authorized teachers.
2. Teachers can manage students, memorization records, and settings.
3. Soft deletion must be enforced (`deleted: true`).
4. Users cannot elevate their own role to 'admin' or alter immutable author identifiers.
5. All document writes must adhere to bounded field sizes, valid IDs, and required schemas.

## 2. Access Control Model
- Global default: Deny all.
- `/teachers/{teacherId}`:
  - Read: If authenticated and (request.auth.uid == teacherId or isActiveTeacher())
  - Create: If authenticated and request.auth.uid == teacherId (cannot set role to admin without authorization)
  - Update: If authenticated and request.auth.uid == teacherId (cannot modify role or id)
- `/students/{studentId}`:
  - Read: If isActiveTeacher()
  - Write (create/update): If isActiveTeacher() and valid student schema
- `/memorization_records/{recordId}`:
  - Read: If isActiveTeacher()
  - Write (create/update): If isActiveTeacher() and valid record schema
- `/settings/{settingId}`:
  - Read: If isActiveTeacher()
  - Write (create/update): If isActiveTeacher() and valid settings schema
