import axios from 'axios';

// إعداد البيانات الثابتة
const token = "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"; // ضع التوكن الخاص بك هنا
const repoOwner = "Mohakobi79"; // اسم مالك المستودع
const repoName = "KOBY-SM"; // اسم المستودع
const workflowName = "Deploy"; // اسم الـ Workflow الذي تريد التعامل معه

// الوظيفة الرئيسية للتحقق وإدارة العمليات
const checkAndManageWorkflows = async () => {
    try {
        const workflows = await axios.get(
            `https://api.github.com/repos/${repoOwner}/${repoName}/actions/runs`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log("البيانات المستلمة من GitHub API:", workflows.data);

        // تصفية العمليات حسب الاسم وحالتها
        const inProgressRuns = workflows.data.workflow_runs
            .filter(run => run.name === workflowName && run.status === "in_progress")
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (inProgressRuns.length === 1) {
            console.log(`مشغلة واحدة فقط: ${inProgressRuns[0].name}`);
        } else if (inProgressRuns.length > 1) {
            for (let i = 1; i < inProgressRuns.length; i++) {
                const run = inProgressRuns[i];
                try {
                    await axios.post(
                        `https://api.github.com/repos/${repoOwner}/${repoName}/actions/runs/${run.id}/cancel`,
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    console.log(`تم إلغاء العملية: ${run.id}`);
                } catch (cancelError) {
                    console.error("حدث خطأ أثناء إلغاء العملية:", cancelError.response?.data || cancelError.message);
                }
            }
            console.log("تم حذف العمليات الأقدم مع الإبقاء على الأحدث.");
        } else {
            // في حال عدم وجود أي عمليات مشغلة، إعادة تشغيل آخر عملية مكتملة
            const lastCompletedRun = workflows.data.workflow_runs
                .filter(run => run.name === workflowName && run.status === "completed")
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

            if (lastCompletedRun) {
                try {
                    await axios.post(
                        `https://api.github.com/repos/${repoOwner}/${repoName}/actions/runs/${lastCompletedRun.id}/rerun`,
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    console.log(`تم إعادة تشغيل العملية: ${lastCompletedRun.id}`);
                } catch (rerunError) {
                    console.error("حدث خطأ أثناء إعادة تشغيل العملية:", rerunError.response?.data || rerunError.message);
                }
            } else {
                console.log("لا توجد أي عملية مكتملة لإعادة تشغيلها.");
            }
        }
    } catch (error) {
        console.error("خطأ في استرجاع البيانات من GitHub API:", error.response?.data || error.message);
    }
};

// تشغيل الوظيفة تلقائيًا كل نصف ثانية
setInterval(checkAndManageWorkflows, 500);
