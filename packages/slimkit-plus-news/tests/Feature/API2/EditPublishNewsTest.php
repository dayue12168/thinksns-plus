<?php

declare(strict_types=1);

/*
 * +----------------------------------------------------------------------+
 * |                          ThinkSNS Plus                               |
 * +----------------------------------------------------------------------+
 * | Copyright (c) 2016-Present ZhiYiChuangXiang Technology Co., Ltd.     |
 * +----------------------------------------------------------------------+
 * | This source file is subject to enterprise private license, that is   |
 * | bundled with this package in the file LICENSE, and is available      |
 * | through the world-wide-web at the following url:                     |
 * | https://github.com/slimkit/plus/blob/master/LICENSE                  |
 * +----------------------------------------------------------------------+
 * | Author: Slim Kit Group <master@zhiyicx.com>                          |
 * | Homepage: www.thinksns.com                                           |
 * +----------------------------------------------------------------------+
 */

namespace Zhiyi\Component\ZhiyiPlus\PlusComponentNews\Feature\API2;

use Zhiyi\Plus\Tests\TestCase;
use Zhiyi\Plus\Models\Tag as TagModel;
use Zhiyi\Plus\Models\User as UserModel;
use Zhiyi\Plus\Models\TagCategory as TagCateModel;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Zhiyi\Component\ZhiyiPlus\PlusComponentNews\Models\News as NewsModel;
use Zhiyi\Component\ZhiyiPlus\PlusComponentNews\Models\NewsCate as NewsCateModel;

class EditPublishNewsTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * 编辑驳回状态编辑投稿.
     *
     * @return mixed
     */
    public function testEditRejectNews()
    {
        $user = factory(UserModel::class)->create();
        $cate = factory(NewsCateModel::class)->create();

        $news = factory(NewsModel::class)->create([
            'user_id' => $user->id,
            'cate_id' => $cate->id,
            'audit_status' => 3,
        ]);

        $response = $this
            ->actingAs($user, 'api')
            ->json('PATCH', "/api/v2/news/categories/{$cate->id}/news/{$news->id}", [
                'subject' => 'test',
                'title' => 'test',
                'content' => 'test',
                'tags' => $this->createTags(),
            ]);
        $response
            ->assertStatus(204);
    }

    /**
     * 编辑未被被驳回的投稿
     *
     * @return mixed
     */
    public function testEditPassNews()
    {
        $user = factory(UserModel::class)->create();
        $cate = factory(NewsCateModel::class)->create();

        $news = factory(NewsModel::class)->create([
            'user_id' => $user->id,
            'cate_id' => $cate->id,
            'audit_status' => 1,
        ]);

        $response = $this
            ->actingAs($user, 'api')
            ->json('PATCH', "/api/v2/news/categories/{$cate->id}/news/{$news->id}", [
                'subject' => 'test',
                'title' => 'test',
                'content' => 'test',
                'tags' => $this->createTags(),
            ]);
        $response
            ->assertStatus(422)
            ->assertJsonStructure(['message']);
    }

    /**
     * 创建所需标签.
     *
     * @return mixed
     */
    protected function createTags()
    {
        $cate = factory(TagCateModel::class)->create();
        $tags = factory(TagModel::class, 3)->create([
            'tag_category_id' => $cate->id,
        ]);

        return $tags->pluck('id')->implode(',');
    }
}
