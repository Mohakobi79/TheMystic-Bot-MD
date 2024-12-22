import axios from 'axios';

// تكوين المستودع والتوكن
const token = "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"; // ضع التوكن الخاص بك هنا
const repoOwner = "Mohakobi79"; // اسم مالك المستودع
const repoName = "bobizaa"; // اسم المستودع
const workflowName = "Deploy"; // اسم الـ Workflow الذي تريد التعامل معه

// تعريف رقم صاحب البوت
global.owner = ['212629268898']; // رقم صاحب البوت الذي يستقبل الرسائل

// وظيفة لإرسال الرسائل إلى صاحب البوت
const sendMessageToOwner = async (message) => {
    try {
        const ownerPhone = global.owner[0];
        // هنا يجب عليك استخدام API لإرسال الرسائل مثل Twilio أو أي خدمة أخرى
        await axios.post('https://api.example.com/send', {
            phone: ownerPhone,
            message: message
        });
        console.log(`تم إرسال الرسالة لصاحب البوت: ${message}`);
    } catch (error) {
        console.error("حدث خطأ أثناء إرسال الرسالة:", error.response?.data || error.message);
    }
};

// وظيفة رئيسية للتحقق من العمليات بشكل دوري
const checkAndCancelWorkflows = async () => {
    try {
        const workflows = await axios.get(
            `https://api.github.com/repos/${repoOwner}/${repoName}/actions/runs`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // تصفية العمليات حسب الاسم وترتيبها حسب الأحدث
        const runs = workflows.data.workflow_runs
            .filter(run => run.name === workflowName && run.status === "in_progress")
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (runs.length > 1) {
            // إلغاء العمليات القديمة مع ترك الأحدث
            for (let i = 1; i < runs.length; i++) {  // بدء من العنصر الثاني للإبقاء على الأحدث
                const run = runs[i];
                try {
                    const cancelResponse = await axios.post(
                        `https://api.github.com/repos/${repoOwner}/${repoName}/actions/runs/${run.id}/cancel`,
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    console.log(`تم إلغاء العملية: ${run.id}`); // تسجيل إلغاء العملية
                    await sendMessageToOwner(`تم إلغاء العملية القديمة: ${run.id}`); // إرسال الرسالة لصاحب البوت
                } catch (cancelError) {
                    console.error("حدث خطأ أثناء إلغاء العملية:", cancelError.response?.data || cancelError.message);
                    await sendMessageToOwner(`خطأ في إلغاء العملية: ${cancelError.response?.data || cancelError.message}`); // إرسال الرسالة لصاحب البوت
                }
            }
            console.log("تم حذف العمليات الأقدم مع الإبقاء على الأحدث.");
            await sendMessageToOwner("تم حذف العمليات الأقدم مع الإبقاء على الأحدث.");
        } else if (runs.length === 1) {
            console.log(`هناك عملية واحدة فقط مشغلة: ${runs[0].name}`);
            await sendMessageToOwner(`هناك عملية واحدة فقط مشغلة: ${runs[0].name}`);
        } else {
            console.log("لا توجد أي عمليات مشغلة حاليًا.");
            await sendMessageToOwner("لا توجد أي عمليات مشغلة حاليًا.");

            // إذا كانت لا توجد أي عملية مشغلة، قم بإعادة تشغيل آخر عملية
            const lastSuccessfulRun = workflows.data.workflow_runs
                .filter(run => run.name === workflowName && run.status === "completed")
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

            if (lastSuccessfulRun) {
                try {
                    const rerunResponse = await axios.post(
                        `https://api.github.com/repos/${repoOwner}/${repoName}/actions/runs/${lastSuccessfulRun.id}/rerun`,
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    console.log(`تم إعادة تشغيل العملية: ${lastSuccessfulRun.id}`);
                    await sendMessageToOwner(`تم إعادة تشغيل العملية الأخيرة: ${lastSuccessfulRun.id}`);
                } catch (rerunError) {
                    console.error("حدث خطأ أثناء إعادة تشغيل العملية:", rerunError.response?.data || rerunError.message);
                    await sendMessageToOwner(`خطأ في إعادة تشغيل العملية: ${rerunError.response?.data || rerunError.message}`);
                }
            } else {
                console.log("لم يتم العثور على عملية مكتملة سابقة لإعادة تشغيلها.");
                await sendMessageToOwner("لم يتم العثور على عملية مكتملة سابقة لإعادة تشغيلها.");
            }
        }
    } catch (error) {
        console.error("خطأ في استرجاع البيانات من GitHub API:", error.response?.data || error.message);
        await sendMessageToOwner(`خطأ في استرجاع البيانات من GitHub API: ${error.response?.data || error.message}`);
    }
};

// تشغيل التحقق كل ثانية
setInterval(checkAndCancelWorkflows, 1000); // فحص العمليات كل ثانية (1000 ملي ثانية)
