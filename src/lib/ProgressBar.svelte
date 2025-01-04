<script>
    export let progress = 0;
</script>

<style>
    .progress-container {
        width: 100%;
        background-color: #e0e0e0;
        border-radius: 10px;
        overflow: hidden;
        margin: 20px 0;
        height: 20px;
    }

    .progress-bar {
        height: 100%;
        background-color: #76c7c0;
        width: 0%;
        transition: width 0.2s ease;
    }

    .progress-text {
        position: absolute;
        width: 100%;
        text-align: center;
        top: 0;
        left: 0;
        line-height: 20px;
        font-size: 12px;
        color: #fff;
    }

    .progress-wrapper {
        position: relative;
        width: 100%;
    }
</style>

<div class="progress-wrapper">
    <div class="progress-container">
        <div class="progress-bar" style="width: {progress}%;"></div>
    </div>
    <div class="progress-text">{progress}%</div>
</div>
