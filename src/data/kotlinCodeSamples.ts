export interface KotlinFile {
  name: string;
  category: string;
  code: string;
}

export const KOTLIN_PROJECT_FILES: KotlinFile[] = [
  {
    name: "MainActivity.kt",
    category: "App Entry",
    code: `package com.halaqah.quranapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import com.halaqah.quranapp.navigation.HalaqahNavGraph
import com.halaqah.quranapp.ui.theme.HalaqahTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            // تفعيل الاتجاه من اليمين إلى اليسار للواجهة العربية بالكامل
            CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                HalaqahTheme {
                    Surface(
                        modifier = Modifier.fillMaxSize(),
                        color = MaterialTheme.colorScheme.background
                    ) {
                        HalaqahNavGraph()
                    }
                }
            }
        }
    }
}`
  },
  {
    name: "Theme.kt",
    category: "Material 3 Theme",
    code: `package com.halaqah.quranapp.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// طابع اللون الأخضر القرآني والأبيض المريح للعين
val QuranGreen = Color(0xFF006D44)
val QuranGreenLight = Color(0xFF8EF7BE)
val QuranGreenDark = Color(0xFF002111)
val QuranGold = Color(0xFFD4AF37)
val SurfaceTint = Color(0xFFF4FAF6)
val OffWhite = Color(0xFFFBFDFC)

private val LightColorScheme = lightColorScheme(
    primary = QuranGreen,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD1E8DB),
    onPrimaryContainer = Color(0xFF002111),
    secondary = Color(0xFF4C6356),
    onSecondary = Color.White,
    background = OffWhite,
    surface = Color.White,
    surfaceVariant = SurfaceTint,
    onSurface = Color(0xFF191C1A)
)

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF6CDBA4),
    onPrimary = Color(0xFF003821),
    primaryContainer = Color(0xFF005232),
    onPrimaryContainer = Color(0xFF8EF7BE),
    background = Color(0xFF0C1511),
    surface = Color(0xFF13201A)
)

@Composable
fun HalaqahTheme(
    darkTheme: Boolean = false,
    content: @Composable () -> Unit
) {
    val colors = if (darkTheme) DarkColorScheme else LightColorScheme
    MaterialTheme(
        colorScheme = colors,
        typography = Typography,
        content = content
    )
}`
  },
  {
    name: "HomeScreen.kt",
    category: "Screens",
    code: `package com.halaqah.quranapp.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.halaqah.quranapp.ui.components.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigateToRecord: (studentId: String?) -> Unit,
    onNavigateToStudents: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("إدارة حلقة التحفيظ") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { onNavigateToRecord(null) },
                icon = { Icon(Icons.Default.Add, contentDescription = null) },
                text = { Text("تسميع جديد") },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item { HadithOfTheDayCard() }
            item { StatsSummaryGrid() }
            item { SectionHeader(title = "طلاب ينتظرون التسميع اليوم") }
            // قائمة الطلاب المنتظرين للتسميع السريع
        }
    }
}`
  },
  {
    name: "DailyRecordScreen.kt",
    category: "Screens",
    code: `package com.halaqah.quranapp.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.halaqah.quranapp.model.EvaluationGrade
import com.halaqah.quranapp.model.RecordType

@Composable
fun DailyRecordScreen(
    studentId: String?,
    onSaveSuccess: () -> Unit
) {
    var selectedType by remember { mutableStateOf(RecordType.NEW_MEMORIZATION) }
    var selectedSurah by remember { mutableStateOf(1) }
    var fromAyah by remember { mutableStateOf("1") }
    var toAyah by remember { mutableStateOf("7") }
    var selectedGrade by remember { mutableStateOf(EvaluationGrade.EXCELLENT) }
    var mistakesCount by remember { mutableStateOf(0) }
    var teacherNotes by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "تسجيل الحفظ والمراجعة اليومية",
            style = MaterialTheme.typography.headlineSmall
        )
        // أزرار الاختيار: حفظ جديد | مراجعة صغرى | مراجعة كبرى
        RecordTypeSegmentedButtons(
            selected = selectedType,
            onSelect = { selectedType = it }
        )
        // محدد السورة والآيات
        SurahAyahPicker(
            surahNumber = selectedSurah,
            fromAyah = fromAyah,
            toAyah = toAyah,
            onSurahChange = { selectedSurah = it }
        )
        // تقييم الإتقان بالنجوم والدرجة
        GradeEvaluationPicker(
            grade = selectedGrade,
            onGradeSelected = { selectedGrade = it }
        )
        // زر الحفظ وإرسال إشعار للواتساب
        Button(
            onClick = { onSaveSuccess() },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("حفظ التسميع وإشعار ولي الأمر")
        }
    }
}`
  }
];
