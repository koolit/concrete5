<? defined('C5_EXECUTE') or die(_("Access Denied.")); ?>

<h1 class="error"><?=t('Page Forbidden')?></h1>

<?=t('You are not authorized to access this page.')?>
<br/>
<br/>

<? $a = new Area("Main"); $a->display($c); ?>

<a href="<?=DIR_REL?>/"><?=t('Back to Home')?></a>.