# بناء تطبيق إدارة حلقة التحفيظ لنظام Android

تم تحويل المشروع إلى تطبيق Android مستقل بواسطة Capacitor بالهوية التالية:

- اسم التطبيق: إدارة حلقة التحفيظ
- معرّف الحزمة: `com.halaqa.management`
- أقل إصدار Android: API 24 (Android 7.0)
- إصدار التطبيق: `1.0`

## استخراج APK من GitHub دون Android Studio

1. أنشئ مستودع GitHub جديدًا، ويفضل أن يكون خاصًا.
2. ارفع جميع محتويات هذا المجلد إلى جذر المستودع. نسخة الرفع عبر المتصفح لا
   تحتوي مجلد `android` عمدًا؛ سينشئه البناء السحابي تلقائيًا.
3. افتح تبويب **Actions** في المستودع.
4. اختر **Build Android APK**.
5. اضغط **Run workflow** ثم **Run workflow** مرة أخرى.
6. انتظر ظهور علامة النجاح الخضراء.
7. افتح عملية البناء الناجحة وانزل إلى قسم **Artifacts**.
8. نزّل `halaqa-management-apk` وفك ضغطه.
9. ثبّت الملف `halaqa-management.apk` على هاتف Android.

هذه نسخة اختبار موقعة تلقائيًا بمفتاح Debug. النسخة النهائية للتوزيع أو المتجر
يجب توقيعها بمفتاح Release ثابت والاحتفاظ بالمفتاح وكلمة مروره بأمان.

## تحديث التطبيق لاحقًا

بعد تعديل ملفات الويب، نفّذ البناء مجددًا. يجب رفع `versionCode` و`versionName`
داخل `android/app/build.gradle` عند إصدار تحديث نهائي موقع.

## البناء محليًا عند توفر Android SDK

```bash
npm ci
npm run android:debug
```

سيظهر APK في:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```
