namespace Core.Constants;

/// <summary>
/// Role constants for the permission system
/// Each role has a hierarchical level where higher roles inherit lower role permissions
/// </summary>
public static class ConstRoles
{
    // Role Codes
    public const string Viewer = "viewer";
    public const string Commenter = "commenter";
    public const string Editor = "editor";
    public const string Organizer = "organizer";
    public const string Admin = "admin";

    /// <summary>
    /// Hierarchical levels for roles
    /// Higher level roles inherit permissions from lower levels
    /// </summary>
    public static class Levels
    {
        public const int Viewer = 1;
        public const int Commenter = 2;
        public const int Editor = 3;
        public const int Organizer = 4;
        public const int Admin = 5;
    }

    /// <summary>
    /// Arabic names for roles
    /// </summary>
    public static class NamesAr
    {
        public const string Viewer = "عارض";
        public const string Commenter = "معلق";
        public const string Editor = "محرر";
        public const string Organizer = "منظم";
        public const string Admin = "مدير";
    }

    /// <summary>
    /// English names for roles
    /// </summary>
    public static class NamesEn
    {
        public const string Viewer = "Viewer";
        public const string Commenter = "Commenter";
        public const string Editor = "Editor";
        public const string Organizer = "Organizer";
        public const string Admin = "Admin";
    }

    /// <summary>
    /// Descriptions in Arabic
    /// </summary>
    public static class DescriptionsAr
    {
        public const string Viewer = "عرض الملفات والمجلدات + نسخ + تحميل فقط";
        public const string Commenter = "كل صلاحيات العارض + إضافة التعليقات";
        public const string Editor = "كل صلاحيات المعلق + إنشاء وتعديل الملفات + الإدارة الأساسية";
        public const string Organizer = "كل صلاحيات المحرر + إدارة المجلدات والأعضاء";
        public const string Admin = "جميع الصلاحيات الكاملة على النظام";
    }

    /// <summary>
    /// Descriptions in English
    /// </summary>
    public static class DescriptionsEn
    {
        public const string Viewer = "View files and folders + copy + download only";
        public const string Commenter = "All Viewer permissions + add comments";
        public const string Editor = "All Commenter permissions + create and edit files + basic management";
        public const string Organizer = "All Editor permissions + manage folders and members";
        public const string Admin = "Full access to all system features";
    }
}
