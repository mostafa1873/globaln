<?php

header('Content-Type: text/plain');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/PHPMailer/src/Exception.php';
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo 'error';
    exit;
}

// بسيط للتنظيف والحماية
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

// تحقق من الحقول الأساسية
if (empty($name) || empty($email) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo 'error';
    exit;
}

$mail = new PHPMailer(true);

try {
    // قراءة إعدادات SMTP من متغيرات البيئة إن وُجِدت (أمن أفضل)، وإلا استخدم القيم الافتراضية
    $smtpHost = getenv('SMTP_HOST') ?: 'smtp.hostinger.com';
    $smtpUser = getenv('SMTP_USER') ?: 'info@globalnexuseg.com';
    $smtpPass = getenv('SMTP_PASS') ?: 'Hamdy55@@@';
    $smtpPort = getenv('SMTP_PORT') ?: 465;
    $smtpSecure = getenv('SMTP_SECURE') ?: 'ssl'; // 'ssl' أو 'tls'

    // إعدادات السيرفر
    $mail->isSMTP();
    $mail->Host = $smtpHost;
    $mail->SMTPAuth = true;
    $mail->Username = $smtpUser;
    $mail->Password = $smtpPass;
    $mail->SMTPSecure = $smtpSecure;
    $mail->Port = (int)$smtpPort;

    // بيانات المرسل والمستقبل
    $mail->setFrom($smtpUser, 'globalnexuseg Website');
    $mail->addAddress('info@globalnexuseg.com'); // الرسائل تصل إلى هذا الإيميل
    $mail->addReplyTo($email, $name);

    // المحتوى
    $mail->isHTML(true);
    $mail->Subject = 'New Contact Message from globalnexus';
    $safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));
    $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
    $safePhone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');

    $mail->Body = "
        <h3>New Message from Website</h3>
        <p><strong>Name:</strong> {$safeName}</p>
        <p><strong>Email:</strong> {$safeEmail}</p>
        <p><strong>Phone:</strong> {$safePhone}</p>
        <p><strong>Message:</strong><br>{$safeMessage}</p>
    ";

    $mail->send();
    echo 'success';
} catch (Exception $e) {
    // يمكنك تسجيل الخطأ في ملف لِلمراجعة لو رغبت
    // error_log('Mail error: ' . $mail->ErrorInfo);
    echo 'error';
}
